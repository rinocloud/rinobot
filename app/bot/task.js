import { spawn } from 'child_process'
import series from 'async/series'
import globule from 'globule'
import crypto from 'crypto'
import fs from 'fs-extra'
import swig from 'swig'
import _ from 'lodash'
import pt from 'path'
import mv from 'mv'
import { checkPythonVersion } from './utils'


export class Task {
  constructor(options) {
    this.readyFunc = () => {}
    this.ignored = false
    this.reason = null

    this.metadata = options.metadata || {}
    this.path = options.path
    this.filename = pt.basename(this.path)
    this.relPath = options.relPath
    this.command = options.command
    this.completedTaskHashList = options.completedTaskHashList
    this.hash = this.command
    this.args = options.args || ''
    this.packagesDir = options.packagesDir || ''
    this.cwd = options.cwd
    this.api = options.api || ''
    this.match = options.match

    series([
      this.setUpLogging.bind(this, options),
      this.createHash.bind(this),
      this.doIgnore.bind(this),
    ], () => {
      this.readyFunc()
    })
  }

  ready(readyFunc) {
    this.readyFunc = readyFunc
  }

  setUpLogging(options, cb) {
    this.on_complete = options.on_complete ? options.on_complete.bind(null, this) : function () {}
    this.on_error = options.on_error ? options.on_error.bind(null, this) : function (err) { throw err } // eslint-disable-line
    this.on_log = options.on_log ? options.on_log.bind(null, this) : function () {}
    cb()
  }

  createHash(done) {
    fs.readFile(this.path, (err, data) => {
      if (err) return this.on_error(err)
      const hash = crypto.createHash('md5')
      hash
        .update(data)
        .update(this.command)
      const digest = hash.digest('base64')
      this.hash = digest
      done()
    })
  }

  doIgnore(cb) {
    if (!globule.isMatch(this.match, this.filename)) {
      this.ignored = true
      this.reason = 'Filename doesnt match task glob'
    }

    if (
        _.has(this.completedTaskHashList, this.command) &&
        this.completedTaskHashList[this.command] === this.hash
    ) {
      this.ignored = true
      this.reason = 'Task already completed'
    }
    cb()
  }

  run() {
    if (this.command === 'rinocloud-upload' ||
        this.command === 'upload' ||
        this.command === 'rinocloud'
      ) {
      this.upload()
    } else if (this.command === 'rinocloud-copy' ||
               this.command === 'copy') {
      this.copy()
    } else if (this.command === 'rinocloud-move' ||
               this.command === 'move') {
      this.move()
    } else if (this.command === 'python') {
      this.python()
    } else if (this.command === 'matlab') {
      this.matlab()
    } else if (this.command === 'Rscript') {
      this.rscript()
    } else {
      this.isPackage(this.command, (isPack) => {
        if (isPack) return this.setUpScript(() => this.pythonPlugin())
        else return this.processCommandLineTask() // eslint-disable-line
      })
    }
  }

  print() {
    return _.omit(this, ['metadata', '_response'])
  }

  upload() {
    this.on_log('starting upload')
    const nixPath = pt.join(this.args, this.relPath).replace(/\\/g, '/')
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

  isPackage(command, cb) {
    fs.access(pt.join(this.packagesDir, this.command), err => {
      if (err) {
        return cb(false)
      } else { // eslint-disable-line
        return cb(true)
      }
    })
  }

  setUpScript(cb) {
    this.codePath = false
    // packages are only in the packagesDir folder,
    // they cannot be in the cwd
    fs.access(pt.join(this.packagesDir, this.command), err => {
      if (err) {
        return this.on_error(`Cant find package "${this.command}"`)
      } else { // eslint-disable-line

        const packagePath = pt.join(this.packagesDir, this.command, 'package.json')
        fs.access(packagePath, err => { // eslint-disable-line
          if (err && err.code === 'ENOENT') {
            return this.on_error(
              `Found ${pt.join(this.packagesDir, this.command)}, but no package.json exists.`
            )
          }
          if (err) {
            return this.on_error(`No package exists matching ${this.command}`)
          }
          return fs.readFile(packagePath, 'utf-8', (err, data) => { // eslint-disable-line
            if (err) return this.on_error(`package.json in "${this.command}" could not be opened`)

            let packageJSON = {}
            try {
              packageJSON = JSON.parse(data)
            } catch (e) {
              return this.on_error(`package.json in "${this.command}" could not be parsed`)
            }

            if (_.has(packageJSON, 'main')) {
              this.codePath = pt.join(this.packagesDir, this.command, packageJSON.main)
              cb()
            } else {
              return this.on_error(`package.json in "${this.command}" has no "main" specified`)
            }
          })
        })
      }
    })
  }

  escapeShellArg(cmd) {
    return cmd.replace(/ /g, '\\ ')
  }

  getLocals() {
    return {
      filepath: this.escapeShellArg(this.path),
      filename: this.escapeShellArg(this.filename),
      path: this.escapeShellArg(`./${this.relPath}`),
      join: (x, y) => pt.join(x, y),
      ...this.metadata
    }
  }

  pythonPlugin() {
    const args = _.trim(swig.render(`${this.codePath} {{filepath}}`, { locals: this.getLocals() }))
    const magicDelimiter = ',,,xxx123'
    const tokens = _.map(args.split(/\\ /g).join(magicDelimiter).split(' '), (arg) =>
      arg.split(new RegExp(magicDelimiter, 'g')).join('\ ') // eslint-disable-line
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

  python() {
    const args = _.trim(swig.render(`${this.escapeShellArg(this.args)} {{filepath}}`, { locals: this.getLocals() })) // eslint-disable-line
    const magicDelimiter = ',,,xxx123'
    const tokens = _.map(args.replace(/\\ /g, magicDelimiter).split(' '), arg =>
      arg.replace(new RegExp(magicDelimiter, 'g'), '\ ').replace(/ /g, '\ ') // eslint-disable-line
    )

    checkPythonVersion(python => {
      if (!python) {
        return this.on_error(
          new Error('No python installed'))
      } else { // eslint-disable-line
        const child = spawn(python, tokens, { cwd: this.cwd })
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
    })
  }

  rscript() {
    const args = _.trim(swig.render(`${this.escapeShellArg(this.args)} {{filepath}}`, { locals: this.getLocals() }))
    const magicDelimiter = ',,,xxx123'
    const tokens = _.map(args.replace(/\\ /g, magicDelimiter).split(' '), arg =>
      arg.replace(new RegExp(magicDelimiter, 'g'), '\ ').replace(/ /g, '\ ') // eslint-disable-line
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

  matlab() {
    const template = "filepath='{{filepath}}';run('{{script}}');;exit;"
    const matlabCode = template
                        .replace('{{filepath}}', this.path)
                        .replace('{{script}}', this.args)

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
    child.stdout.on('data', (s) => this.on_log(`\n${s.toString()}`))
    child.stderr.on('data', this.on_log)
    child.on('close', (code) => {
      if (child.hasOwnProperty('error')) return
      if (code !== 0) {
        return this.on_error(
          new Error(
            `An error occured (code ${code}) while running "${this.command} ${this.args.split('  ')}"`)) // eslint-disable-line
      } else { // eslint-disable-line
        return this.on_complete()
      }
    })
  }

  copy() {
    this.on_log('starting copy')
    const args = _.trim(swig.render(this.args, { locals: this.getLocals() }))
    fs.copy(this.path, pt.join(args, this.filename), err => {
      if (err) return this.on_error(err)
      return this.on_complete()
    })
  }

  move() {
    this.on_log('starting move')
    const args = _.trim(swig.render(this.args, { locals: this.getLocals() }))
    mv(this.path, pt.join(args, this.filename), { mkdirp: true, clobber: true }, (err) => {
      if (err) return this.on_error(err)
      return this.on_complete()
    })
  }

  processCommandLineTask() {
    const args = _.trim(swig.render(this.args, { locals: this.getLocals() }))
    const magicDelimiter = ',,,xxx123'
    const tokens = _.map(args.replace(/\\ /g, magicDelimiter).split(' '), (arg) =>
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
