import series from 'async/series'
import globule from 'globule'
import crypto from 'crypto'
import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import runR from './runR'
import runPlugin from './runPlugin'
import runPython from './runPython'
import runMatlab from './runMatlab'
import runCommand from './runCommand'
import runUpload from './runUpload'
import runCopy from './runCopy'
import runMove from './runMove'
import hashFile from './hashFile'

export class Task {
  constructor(opts) {
    this.onComplete = opts.onComplete.bind(null, this)
    this.onError = opts.onError.bind(null, this)
    this.onLog = opts.onLog.bind(null, this)

    this.filepath = opts.filepath
    this.baseDir = opts.baseDir
    this.pluginsDir = opts.pluginsDir || ''

    this.command = opts.command
    this.match = opts.match
    this.args = opts.args || ''
    this.completedTaskHashList = opts.completedTaskHashList
    this.apiToken = opts.apiToken

    this.readyFunc = () => {}
    this.ignored = false
    this.reason = null
    this.relativePath = pt.relative(this.baseDir, this.filepath)

    this.filename = pt.basename(this.filepath)
    this.hash = this.command

    series([
      this.createHash.bind(this),
      this.checkIgnore.bind(this),
    ], () => {
      this.readyFunc()
    })
  }

  ready(readyFunc) {
    this.readyFunc = readyFunc
  }

  done(response) {
    // this is where we insert the hash into
    // some record file, then we call onComplete
    console.log(response.body)
    console.log()

    this.onComplete()
  }

  createHash(done) {
    hashFile(this.filepath, (err, fileHash) => {
      if (err) return this.onError(err)
      const hash = crypto.createHash('md5')
      hash
        .update(fileHash)
        .update(this.command)
        .update(this.filepath)
      const digest = hash.digest('hex')
      this.hash = digest
      done()
    })
  }

  checkIgnore(cb) {
    if (globule.isMatch(['*.json', '*.yaml', '*.yml'], this.filename)) {
      // do sync
    }

    if (!globule.isMatch(this.match, this.filename)) {
      this.ignored = true
      this.reason = 'Filename doesnt match task glob'
    }

    if (this.filepath.indexOf('.rino') > -1) {
      this.ignored = true
      this.reason = 'Ignoring .rino repository'
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
        if (isPack) return this.pythonPlugin()
        else return this.commandLineTask() // eslint-disable-line
      })
    }
  }

  isPackage(command, cb) {
    fs.access(pt.join(this.pluginsDir, this.command), err => {
      if (err) {
        return cb(false)
      } else { // eslint-disable-line
        return cb(true)
      }
    })
  }

  escapeShellArg(cmd) {
    return cmd.replace(/ /g, '\\ ')
  }

  getLocals() {
    return {
      filepath: this.escapeShellArg(this.filepath),
      filename: this.escapeShellArg(this.filename),
      path: this.escapeShellArg(`./${this.relativePath}`),
      join: (x, y) => pt.join(x, y)
    }
  }

  upload() {
    runUpload({
      apiToken: this.apiToken,
      args: this.args,
      filepath: this.filepath,
      relativePath: this.relativePath,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done
    })
  }

  pythonPlugin() {
    runPlugin({
      pluginsDir: this.pluginsDir,
      command: this.command,
      locals: this.getLocals(),
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done
    })
  }

  python() {
    runPython({
      codePath: this.escapeShellArg(this.args),
      locals: this.getLocals(),
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done
    })
  }

  matlab() {
    runMatlab({
      filepath: this.filepath,
      args: this.args,
      locals: this.getLocals(),
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done
    })
  }

  rscript() {
    runR({
      codePath: this.escapeShellArg(this.args),
      locals: this.getLocals(),
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done
    })
  }

  commandLineTask() {
    runCommand({
      locals: this.getLocals(),
      cwd: this.baseDir,
      args: this.args,
      command: this.command,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done
    })
  }

  copy() {
    runCopy({
      locals: this.getLocals(),
      args: this.args,
      filepath: this.filepath,
      filename: this.filename,
      onError: this.onError,
      onComplete: this.done
    })
  }

  move() {
    runMove({
      locals: this.getLocals(),
      args: this.args,
      filepath: this.filepath,
      filename: this.filename,
      onError: this.onError,
      onComplete: this.done
    })
  }
}
