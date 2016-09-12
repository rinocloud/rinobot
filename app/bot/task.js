import series from 'async/series'
import globule from 'globule'
import crypto from 'crypto'
import moment from 'moment'
import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import { isMatch } from './utils'
import runR from './runR'
import runPlugin from './runPlugin'
import runPython from './runPython'
import runMatlab from './runMatlab'
import runCommand from './runCommand'
import runUpload from './runUpload'
import runCopy from './runCopy'
import runMove from './runMove'
import hashFile from './hashFile'
import mergeHistory from './mergeHistory'
import readHistory from './readHistory'

export class Task {
  /*
    Rinobot Task

    const task = new Task({
      onComplete: function(){}
      onLog: function(){}
      onError: function(){}
      filepath: absolute filepath
      baseDir: the directory being watched by Rinobot
      pluginsDir: absolute filepath to plugins
      command: name of task to run
      march: pattern to match file with
      args: any arguments to the command
      apiToken: Rinocloud api token
    })

    task.ready(() => {
      if (!task.ignored) {
        // task wasnt ignored so we run it
        task.run()
      } else {
        // task was ignored
        // can get the reason
        console.log(task.reason)
      }
    })
  */

  constructor(opts) {
    this.onComplete = () => opts.onComplete(this)
    this.onLog = (message) => opts.onLog(this, message)

    this.onError = (err) => {
      // TODO: take task out of history
      this.removeCurrentTask(() => {
        opts.onError(this, err)
      })
    }


    this.filepath = opts.filepath
    this.baseDir = opts.baseDir
    this.pluginsDir = opts.pluginsDir || ''

    this.command = opts.command
    this.match = opts.match
    this.args = opts.args || ''
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
      this.writeInitialHistory.bind(this)
    ], () => {
      this.readyFunc()
    })
  }

  ready(readyFunc) {
    this.readyFunc = readyFunc
  }

  createHash(cb) {
    hashFile(this.filepath, (err, etag) => {
      if (err) return this.onError(err)
      const hash = crypto.createHash('md5')
      hash
        .update(etag)
        .update(this.command)
        .update(this.filepath)
      const digest = hash.digest('hex')
      this.etag = etag
      this.hash = digest
      cb()
    })
  }

  checkIgnore(cb) {
    if (globule.isMatch(['*.json', '*.yaml', '*.yml'], this.filename)) {
      // do update of metadata
    }

    const passing = isMatch(this.match, this.filename)

    if (!passing) {
      this.ignored = true
      this.reason = 'Filename doesnt match task glob'
    }

    if (this.filepath.indexOf('.rino') > -1) {
      this.ignored = true
      this.reason = 'Ignoring .rino repository'
    }

    const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
    readHistory(historyFilePath, this.filepath, (err, history) => {
      if (err) {
        this.ignored = true
        return this.onError(err)
      }

      if (!history) {
        return cb()
      }

      const taskString = `${this.command},${this.args}`

      if (history.completed.includes(taskString)) {
        this.ignored = true
        this.reason = `Already ran ${this.command} with arguments ${this.args}`
      }

      cb()
    })
  }

  writeInitialHistory(cb) {
    const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
    mergeHistory(historyFilePath, this.filepath, {
      etag: this.etag,
      lastRun: moment().toISOString(),
      current: this.ignored ? null : this.command
    }, (err, history) => {
      if (err) this.onError(err)
      else {
        this.history = history
        cb()
      }
    })
  }

  removeCurrentTask(cb) {
    const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
    const lastRun = moment().toISOString()

    readHistory(historyFilePath, this.filepath, (err, history) => {
      if (err) return this.onError(err)

      const completed = _.clone(history.completed)
      completed.push(`${this.command},${this.args}`)

      mergeHistory(historyFilePath, this.filepath,
        {
          lastRun,
          current: null,
        },
      (er, _history) => {
        this.history = _history
        cb()
      })
    })
  }

  done(response) {
    // this is where we insert the hash into
    // some record file, then we call onComplete
    const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
    const lastRun = moment().toISOString()

    readHistory(historyFilePath, this.filepath, (err, history) => {
      if (err) return this.onError(err)

      const completed = _.clone(history.completed)
      completed.push(`${this.command},${this.args}`)

      mergeHistory(historyFilePath, this.filepath,
        {
          lastRun,
          etag: this.etag,
          completed,
          current: null,
          id: response ? response.body.id : null,
        },
      (er, _history) => {
        if (er) return this.onError(er)
        this.history = _history
        this.onComplete()
      })
    })
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

  getLocals() {
    return {
      filepath: this.filepath,
      filename: this.filename,
      path: `./${this.relativePath}`,
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
      onComplete: this.done.bind(this)
    })
  }

  pythonPlugin() {
    runPlugin({
      pluginsDir: this.pluginsDir,
      command: this.command,
      filepath: this.filepath,
      args: this.args,
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done.bind(this)
    })
  }

  python() {
    runPython({
      codePath: this.args,
      locals: this.getLocals(),
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done.bind(this)
    })
  }

  matlab() {
    runMatlab({
      codePath: this.args,
      filepath: this.getLocals().filepath,
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done.bind(this)
    })
  }

  rscript() {
    runR({
      codePath: this.args,
      locals: this.getLocals(),
      cwd: this.baseDir,
      onError: this.onError,
      onLog: this.onLog,
      onComplete: this.done.bind(this)
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
      onComplete: this.done.bind(this)
    })
  }

  copy() {
    runCopy({
      locals: this.getLocals(),
      args: this.args,
      filepath: this.filepath,
      filename: this.filename,
      onError: this.onError,
      onComplete: this.done.bind(this)
    })
  }

  move() {
    runMove({
      locals: this.getLocals(),
      args: this.args,
      filepath: this.filepath,
      filename: this.filename,
      onError: this.onError,
      onComplete: this.done.bind(this)
    })
  }
}
