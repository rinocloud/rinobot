import series from 'async/series'
import globule from 'globule'
import crypto from 'crypto'
import moment from 'moment'
import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import shortid from 'shortid'
import runR from './runR'
import runPlugin from './runPlugin'
import runPython from './runPython'
import runMatlab from './runMatlab'
import runCommand from './runCommand'
import runUpload from './runUpload'
import runCopy from './runCopy'
import runMove from './runMove'
import hashFile from '../utils/hashFile'
import {
  addCreated,
  mergeHistory,
  readHistory
} from '../history'


export const createTask = (opts) =>
  new Task({
    ...opts
  })


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
      args: any arguments to the command
      apiToken: Rinocloud api token
    })

    task.ready(() => {
      if (!task.ignored) {
        task.run()
      } else {
        // task is a repeat
      }
    })
  */

  constructor(opts) {
    this.onComplete = () => opts.onComplete && opts.onComplete(this)
    this.onLog = (message) => opts.onLog && opts.onLog(this, message)

    this.onError = (err) =>
      opts.onComplete && this.removeHistory(() => {
        opts.onComplete(this, err)
      })

    this.filepath = opts.filepath
    this.baseDir = opts.baseDir
    this.pluginsDir = opts.pluginsDir || ''

    this.command = opts.command
    this.args = opts.args || ''
    this.apiToken = opts.apiToken || null
    this.keep = opts.keep

    this.matlabRoot = opts.matlabRoot || null
    this.pythonRoot = opts.pythonRoot || null
    this.rRoot = opts.rRoot || null

    this.readyFunc = () => {}
    this.ignored = opts.logOnly || false
    this.relativePath = pt.relative(this.baseDir, this.filepath)

    this.filename = pt.basename(this.filepath)
    this.hash = this.command

    /*  prefix for the output filename so that we know
        when a plugin creates a file.
        we will add this file to the history so that this
        task command wont get run on it again.
    */
    this.outputPrefix = `.${shortid.generate().substring(0, 7)}.rino.`
    this.outputFilename = null

    series([
      (cb) => {
        this.createHash(this.filepath, this.filepath, this.command,
          (err, etag, hash) => {
            if (err) return this.onError(err)
            this.etag = etag
            this.hash = hash
            cb()
          }
        )
      },
      this.isRepeat.bind(this),
      this.initHistory.bind(this)
    ], () => {
      this.readyFunc(this)
    })
  }

  ready(readyFunc) {
    this.readyFunc = readyFunc
  }

  createHash(fpath, fname, command, cb) {
    hashFile(fpath, (err, etag) => {
      if (err) return cb(err)
      const hash = crypto.createHash('md5')
      hash
        .update(etag)
        .update(command)
        .update(fname)
      const digest = hash.digest('hex')
      cb(null, etag, digest)
    })
  }

  taskString() {
    return `${this.command},${this.args}`
  }

  isRepeat(cb) {
    /*
      checks if this task has already been done for this file.
    */
    const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
    readHistory(historyFilePath, this.filepath, (err, history) => {
      if (err) {
        this.ignored = true
        return this.onError(err)
      }
      if (!history) return cb()
      if (history.completed.includes(this.taskString())) {
        this.ignored = true
      }
      cb()
    })
  }

  initHistory(cb) {
    /*
      initial write to the history database about this
      file and this command.

      It merges the history - so if it already exists, it will
      just update the etag, and set the current task for the UI
    */
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

  removeHistory(cb) {
    /*
      remove this task as the currently running task from the history
    */
    const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
    mergeHistory(historyFilePath, this.filepath,
      { current: null },
      (er, _history) => {
        this.history = _history
        cb()
      }
    )
  }

  done(response) {
    /*
      called when task finishes successfully, we update `lastRun`, add the command to
      the completed tasks list, and unset current task.
    */

    const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
    const lastRun = moment().toISOString()

    readHistory(historyFilePath, this.filepath, (err, history) => {
      if (err) return this.onError(err)

      const completed = _.has(history, 'completed') ? _.clone(history.completed) : []
      completed.push(this.taskString())

      mergeHistory(historyFilePath, this.filepath,
        {
          lastRun,
          completed,
          current: null,
          id: response ? response.body.id : null,
        },
      (er, _history) => {
        if (er) return this.onError(er)
        this.history = _history
        this.outputFileHistory()
      })
    })
  }

  outputFileHistory() {
    /*
      This functions creates a record in the history.json
      saying that the current task has run on the output file.
      The current task didnt actually run on the output file,
      but this is an easy way to stop infinite recursion.
    */
    const globMatches = globule.find(`${this.outputPrefix}*`, {
      srcBase: pt.dirname(this.filepath)
    })

    if (globMatches.length > 0) {
      this.outputFilename = globMatches[0]
    } else {
      return this.onComplete()
    }

    const hiddenOpath = pt.join(pt.dirname(this.filepath),
      this.outputFilename)

    const removePrefix = (name) => {
      if (name.substring(8, 14) === '.rino.') {
        return removePrefix(name.substring(14))
      }

      return name
    }

    let Opath = hiddenOpath
    if (this.keep) {
      Opath = pt.join(pt.dirname(this.filepath), removePrefix(this.outputFilename))
    }

    const createdFilePath = pt.join(this.baseDir, '.rino', 'created.json')
    addCreated(createdFilePath, Opath, (e, created) => {
      this.createdList = created

      if (e) return this.onError(e)
      this.createHash(hiddenOpath, Opath, this.command,
        (err, etag) => {
          if (err) return this.onError(err)
          const historyFilePath = pt.join(this.baseDir, '.rino', 'history.json')
          const lastRun = moment().toISOString()
          mergeHistory(historyFilePath, Opath,
            {
              lastRun,
              etag,
              completed: [this.taskString()],
              current: null
            },
          (er) => {
            if (er) return this.onError(er)

            if (this.keep) {
              fs.copy(hiddenOpath, Opath, (er) => { // eslint-disable-line
                if (er) return this.onError(er)
                this.outputFilename = pt.basename(Opath)
                this.onComplete()
                setTimeout(() => fs.unlink(hiddenOpath), 500)
              })
            } else {
              this.outputFilename = pt.basename(hiddenOpath)
              this.onComplete()
            }
          })
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
      prefix: this.outputPrefix,
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
      root: this.matlabRoot,
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
      root: this.rRoot,
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
      root: this.pythonRoot,
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
