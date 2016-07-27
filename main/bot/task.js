import globule from 'globule'
import omit from 'lodash/omit'
import trim from 'lodash/trim'
import map from 'lodash/map'
import fs from 'fs-extra'
import swig from 'swig'
import pt from 'path'
import { spawn } from 'child_process'

export class Task {
  /*
  const task = new Task(options)

  options has properties:

  metadata: {}, any metadata to add to the command line task and upload,
  filename: the filename,
  relPath: relative path from the file to the watchPath,
  command: command to run - either a rinocloud command or a cli program,
  args: arguments for the command line program,
  cwd: where to set the cwd if its a cli program,
  event: the chokidar event,
  match: glob to match the task with the filename,

  on_complete: function (task),
  on_error: function (task),
  on_ignore: function (task),
  on_log: function (task),
  */

  constructor(options) {
    this.aborted = false
    this.ignored = false

    this.metadata = options.metadata || {}
    this.path = options.path
    this.filename = pt.basename(this.path)
    this.relPath = options.relPath
    this.command = options.command
    this.args = options.args || []
    this.packagesDir = options.packagesDir || ''
    this.cwd = options.cwd
    this.uploadTo = options.uploadTo || ''
    this.api = options.api || ''
    this.match = options.match
    this.on = options.on || 'all'

    this.setUpLogging(options)

    if (!globule.isMatch(this.match, this.filename)) {
      this.ignored = true
      return this.on_ignore('Filename doesnt match task glob')
    }

  }

  run() {
    if (this.command === 'rinocloud-upload' ||
        this.command === 'upload' ||
        this.command === 'rinocloud'
      ) {
      this.upload()
    } else if ( this.command === 'rinocloud-copy' ||
                this.command === 'copy') {
      this.copy()
    } else if ( this.command === 'python' ) {
      this.setUpScript(() => this.python())
    } else if ( this.command === 'matlab' ) {
      this.setUpScript(() => this.matlab())
      this.matlab()
    } else if ( this.command === 'Rscript' ) {
      this.setUpScript(() => this.rscript())
    } else {
      this.processCommandLineTask()
    }
  }

  setUpLogging(options) {
    this.on_complete = options.on_complete ? options.on_complete.bind(null, this) : function () {}
    this.on_error = options.on_error ?
      options.on_error.bind(null, this) : function (err) { throw err }

    this.on_ignore = function (reason) {
      this.ignored = true
      const emitIgnore = options.on_ignore ? options.on_ignore.bind(null, this) : function () {}
      emitIgnore(reason)
    }.bind(this)

    this.on_log = options.on_log ? options.on_log.bind(null, this) : function () {}
  }

  print() {
    return omit(this, ['metadata', '_response'])
  }

  upload() {
    this.on_log('starting upload')

    const nixPath = pt.join(this.uploadTo, this.relPath).replace(/\\/g, '/')
    const m = this.metadata || {}
    m.name = `${nixPath}`
    return this.api.s3uploadElectron(
        this.path, m, this.uploadProgress.bind(this), this.on_error, this.uploadComplete.bind(this))
  }

  uploadProgress(total, loaded) {
    const percent = (loaded / total) * 100
    this.on_log(`uploading progress ${percent.toFixed(2)}%`)
  }

  uploadComplete(response) {
    this.on_log('upload complete')
    this._response = response.body
    return this.on_complete()
  }

  setUpScript(cb){
    this.codePath = false
    return fs.access(pt.join(this.cwd, this.args), err => {
      if (err && err.code !== 'ENOENT') return this.on_error(err)
      if (!err) {
        this.codePath = pt.join(this.cwd, this.args)
        return cb()
      } else {
        fs.access(pt.join(this.packagesDir, this.args), err => {
          if (err) {
            return this.on_error(err)
          } else {
            fs.access(pt.join(this.packagesDir, this.args, 'package.json'), err => {
              if (err && err.code === 'ENOENT') {
                return this.on_error(
                  `Found ${pt.join(this.packagesDir, this.args)}, but no package.json exists.`
                )
              }
              if (err) {
                return this.on_error(`No package exists matching ${this.args}`)
              }

              return fs.readFile(pt.join(this.packagesDir, this.args, 'package.json'), 'utf-8', (err, data) => {
                if (err) return this.on_error(err)
                const packageJSON = JSON.parse(data)

                if (_.has(packageJSON, 'main')) {

                  this.codePath = pt.join(this.packagesDir, this.args, packageJSON.main)
                  cb()
                } else {
                  return this.on_error(`package.json has no "main" specified`)
                }
              })

            })
          }
        })
      }

    })
  }

  escapeShellArg(cmd) {
    return cmd.replace(/ /g, '\\ ')
  }

  getLocals(){
    return {
      filepath: this.escapeShellArg(this.path),
      filename: this.escapeShellArg(this.filename),
      path: this.escapeShellArg(`./${this.relPath}`),
      join: (x, y) => pt.join(x, y),
      ...this.metadata
    }
  }

  python(){
    const args = trim(swig.render(this.codePath + ' {{filepath}}', { locals: this.getLocals() }))
    const magicDelimiter = ',,,xxx123'
    const tokens = map(args.replace(/\\ /g, magicDelimiter).split(' '), (arg) =>
      arg.replace(new RegExp(magicDelimiter, 'g'), '\ ') // eslint-disable-line
    )

    const child = spawn('python', tokens, { cwd: this.cwd })
    child.on('error', (error) => {
      child.error = true
      return this.on_error(error)
    })
    child.stdout.on('data', this.on_log)
    child.stderr.on('data', this.on_log)
    child.on('close', (code) => {
      if (child.hasOwnProperty('error')) return
      if (code !== 0) {
        return this.on_error(
          new Error(
            `An error occured (code ${code}) while running "${this.command} ${args.split('  ')}"`))
      } else { // eslint-disable-line
        return this.on_complete()
      }
    })
  }

  rscript(){
    console.log(this.codePath)

    const args = trim(swig.render(this.codePath + ' {{filepath}}', { locals: this.getLocals() }))
    const magicDelimiter = ',,,xxx123'
    const tokens = map(args.replace(/\\ /g, magicDelimiter).split(' '), (arg) =>
      arg.replace(new RegExp(magicDelimiter, 'g'), '\ ') // eslint-disable-line
    )

    const child = spawn('Rscript', tokens, { cwd: this.cwd })
    child.on('error', (error) => {
      child.error = true
      return this.on_error(error)
    })
    child.stdout.on('data', this.on_log)
    child.stderr.on('data', this.on_log)
    child.on('close', (code) => {
      if (child.hasOwnProperty('error')) return
      if (code !== 0) {
        return this.on_error(
          new Error(
            `An error occured (code ${code}) while running "${this.command} ${args.split('  ')}"`))
      } else { // eslint-disable-line
        return this.on_complete()
      }
    })
  }

  matlab(){
    const template = "filepath='{{filepath}}';run('{{script}}');;exit;"
    const matlabCode = template
                        .replace('{{filepath}}', this.path)
                        .replace('{{script}}', this.codePath)

    const tokens = [
      '-nodisplay',
      '-nosplash',
      '-nodesktop',
      '-r',
      matlabCode
    ]

    const child = spawn('matlab', tokens, { cwd: this.cwd })
    child.on('error', (error) => {
      child.error = true
      return this.on_error(error)
    })
    child.stdout.on('data', this.on_log)
    child.stderr.on('data', this.on_log)
    child.on('close', (code) => {
      if (child.hasOwnProperty('error')) return
      if (code !== 0) {
        return this.on_error(
          new Error(
            `An error occured (code ${code}) while running "${this.command} ${args.split('  ')}"`))
      } else { // eslint-disable-line
        return this.on_complete()
      }
    })
  }

  copy() {
    this.on_log('starting copy')
    const args = trim(swig.render(this.args, { locals: this.getLocals() }))
    fs.copy(this.path, args, (err) => {
      if (err) return this.on_error(err)
      return this.on_complete()
    })
  }

  processCommandLineTask() {
    const args = trim(swig.render(this.args, { locals: this.getLocals() } ))
    const magicDelimiter = ',,,xxx123'
    const tokens = map(args.replace(/\\ /g, magicDelimiter).split(' '), (arg) =>
      arg.replace(new RegExp(magicDelimiter, 'g'), '\ ') // eslint-disable-line
    )

    const child = spawn(this.command, tokens, { cwd: this.cwd })
    child.on('error', error => {
      child.error = true
      return this.on_error(error)
    })
    child.stdout.on('data', this.on_log)
    child.stderr.on('data', this.on_log)
    child.on('close', code => {
      if (child.hasOwnProperty('error')) return
      if (code !== 0) {
        return this.on_error(
          new Error(
            `An error occured (code ${code}) while running "${this.command} ${args.split('  ')}"`))
      } else { // eslint-disable-line
        return this.on_complete()
      }
    })
  }
}
