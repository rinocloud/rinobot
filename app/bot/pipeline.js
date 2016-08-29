import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import yaml from 'js-yaml'
import series from 'async/series'
import mkdirp from 'mkdirp'
import globule from 'globule'
import getConfig from './config'
import * as api from '../api/api'
import * as scheduler from './scheduler'
import { Task } from './task'

export class Pipeline {
  /*
  const pipeline = new Pipeline(options)

  options has three required properties

  - path: Path, the path given by the chokidar event
  - watchPath: Path, the path of the root directory being watched

  options has some optional properties

  - on_complete: function (pipeline), called when the entire pipeline completes successfully
  - on_error: function (pipeline, err), called if the pipeline fails to complete
  - on_ignore: function (pipeline, reason), called if the pipeline ignores the file
  - on_log: function (pipeline, message), general log for entire pipeline
  - on_task_complete: function (pipeline, task), called when a task completes
  - on_task_start: function (pipeline, task), called when a task starts
  - on_task_error: function (pipeline, task, err), called when a task fails
  - on_task_ignore: function (pipeline, task), called if the task has alredy
                    been completed, or ignored for some other reason
  - api: rinocloud-javascript api instance, defaults to making its own instance
  */

  constructor(options) {
    this.readyFunc = () => {}
    this.ignored = false
    this.reason = null
    this.retry = options.retry || false
    this.packagesDir = options.packagesDir || null
    this.timeout = 1
    this.setUpLogging(options)

    this.start(options)
  }

  ready(readyFunc) {
    this.readyFunc = readyFunc
  }

  start(options) {
    this.setUpPaths(options)

    fs.access(this.configPath, (err) => {
      if (err) return this.on_error(err)
      series([
        this.setUpConfig.bind(this),
        this.setUpAPI.bind(this, options),
        this.getDiary.bind(this),
        this.doIgnore.bind(this)
      ], () => {
        this.readyFunc()
      })
    })
  }

  setUpLogging(options) {
    this.on_complete = options.on_complete ? options.on_complete.bind(null, this) : function () {}
    this.on_error = options.on_error ? options.on_error.bind(null, this) : function (e) { throw e }
    this.on_task_complete = options.on_task_complete ? options.on_task_complete.bind(null, this) : function () {} // eslint-disable-line
    this.on_task_ignore = options.on_task_ignore ? options.on_task_ignore.bind(null, this) : function () {} // eslint-disable-line
    this.on_task_start = options.on_task_start ? options.on_task_start.bind(null, this) : function () {} // eslint-disable-line

    this.on_ignore = (reason) => {
      this.ignored = true
      this.reason = reason
      const emitIgnore = options.on_ignore ? options.on_ignore.bind(null, this) : function () {}
      emitIgnore(reason)
    }

    this.on_log = options.on_log ? options.on_log.bind(null, this) : function () {}
  }

  setUpPaths(options) {
    this.path = options.path
    // just the filename
    this.filename = pt.basename(this.path)
    // the folder path which is being watched
    this.watchPath = options.watchPath
    this.configPath = pt.join(this.watchPath, 'rino.yaml')
    // the relative path from the watched folder
    // used for printing and for sending to rinocloud - cant be loaded
    this.relPath = pt.relative(this.watchPath, this.path)
    // path of rino repo where we hold server response files
    this.repoPath = pt.join(this.watchPath, '.rino')
    // the path without the filename
    this.dirname = pt.dirname(this.path)
    // where the meetadata file does
    this.hiddenMetadataFile = pt.join(this.repoPath, `${this.relPath}.json`)
    // path to the user created metadata file eg: 'test.txt.json'
    this.metadataFilePath = null;
  }

  setUpConfig(cb) {
    return getConfig(this.watchPath, (config) => {
      this.config = config
      if (!this.config) {
        return this.on_error(new Error('Couldn\'t get config from the rino.yaml file'))
      }

      this.tasks = this.config.tasks || []
      this.userMetadata = this.config.metadata || {}
      this.metadata = this.userMetadata
      if (cb) cb()
    })
  }

  getDiary(cb) {
    fs.readFile(this.hiddenMetadataFile, (err, data) => {
      if (err) {
        this.diary = {
          finished: false,
          completedTasks: {}
        }
        return cb()
      }

      this.diary = JSON.parse(data)
      cb()
    })
  }

  setUpAPI(options, cb) {
    this.api = options.api || api
    this.api.auth(this.config.apiToken)
    this.api.setBase('https://rinocloud.com')
    if (this.config.base) {
      this.api.setBase(this.config.base)
    }
    if (cb) cb()
  }

  doIgnore(cb) {
    if (globule.isMatch(this.config.ignore, this.filename)) {
      // this.on_ignore('Ignoring file type')
      this.ignored = true
      this.syncMetadata()
    }

    // if its in the .rino repository then ignore
    if (this.relPath.indexOf('.rino') > -1) {
      this.on_ignore('Ignoring .rino repository')
      this.ignored = true
    }

    // if the change pertains to a directory then ignore
    fs.lstat(this.path, (stat) => {
      if (stat && stat.isDirectory()) {
        this.on_ignore('Ignoring directory events')
        this.ignored = true
      }
    })

    const matchesNone = _.every(this.tasks, task =>
     !globule.isMatch(task.match, this.filename)
    )

    if (matchesNone) {
      this.on_ignore('Matches no tasks')
      this.ignored = true
    }

    fs.exists(this.repoPath, (exists) => {
      if (!exists) mkdirp(this.repoPath, () => {})
    })

    cb()
  }

  getParser(ext) {
    if (ext === '.json') return JSON.parse
    if (ext === '.yaml') return yaml.safeLoad
    return null
  }

  attemptMetadataParse(cb) {
    const filePathNoExt = pt.join(
      this.dirname, this.filename.substr(0, this.filename.lastIndexOf('.'))
    )
    const _noExtGlobs = this.config.metadataExtensions.map((ext) => filePathNoExt + ext)
    const _wiExtGlobs = this.config.metadataExtensions.map((ext) => this.path + ext)
    const globs = _noExtGlobs.concat(_wiExtGlobs)

    const globResults = globule.find(globs)

    if (!globResults.length) { return cb() }

    if (globResults.length > 1) {
      this.on_error(
        new Error(`${globResults.length} conflicting metadata files. Should only be one.`))
      return cb()
    }

    this.metadataFilePath = globResults[0]
    const parser = this.getParser(pt.extname(this.metadataFilePath))
    if (!parser) return cb()

    let parsed = {}

    fs.readFile(this.metadataFilePath, 'utf-8', (err, data) => {
      if (err) return this.on_error(err)
      parsed = parser(data)
      this.metadata = {
        ...this.userMetadata,
        ...parsed
      }

      this.extendDiary({ metadata: this.metadata })
      this.writeDiary(cb)
    })
  }

  syncMetadata() {
    const dataFile = pt.join(this.dirname, this.filename.substr(0, this.filename.lastIndexOf('.')))
    const dataFileRelPath = pt.relative(this.watchPath, dataFile)
    const dataFileHiddenMetadataFile = pt.join(this.repoPath, `${dataFileRelPath}.json`)

    this.attemptMetadataParse(() => {
      fs.exists(dataFile, (exists) => {
        if (!exists) return // this.on_log(`Ignoring filetype.`)
        fs.exists(dataFileHiddenMetadataFile, (exists) => { // eslint-disable-line
          if (!exists) return this.on_log('No data file yet for metadata file.')

          fs.readFile(dataFileHiddenMetadataFile, (err, data) => {
            if (err) return this.on_error(err)
            const dataFileDiary = JSON.parse(data)
            if (!dataFileDiary.hasOwnProperty('response')) {
              return this.on_log('Data file has not been uploaded.')
            }

            this.on_log('Synching metadata')

            this.api
              .updateMerge(dataFileDiary.response.id, _.cloneDeep(this.metadata))
              .then((response) => {
                _.extend(dataFileDiary, { response })
                _.extend(dataFileDiary, { metadata: response.metadata })
                mkdirp(pt.dirname(dataFileHiddenMetadataFile), (err) => {
                  if (err) return this.on_error(err)
                  const metadataString = JSON.stringify(dataFileDiary, null, 4)
                  fs.writeFile(dataFileHiddenMetadataFile, metadataString, this.on_complete)
                })
              })
              .catch((err) => {
                this.on_error(err)
              })
          })
        })
      })
    })
  }

  writeDiary(cb) {
    mkdirp(pt.dirname(this.hiddenMetadataFile), (err) => {
      if (err) return this.on_error(err)
      const metadataString = JSON.stringify(this.diary, null, 4)
      fs.writeFile(this.hiddenMetadataFile, metadataString, cb)
    })
  }

  extendDiary(obj) {
    _.extend(this.diary, obj)
  }

  logTask(task) {
    this.diary.completedTasks[task.command] = task.hash
  }

  run() {
    // lets make a list of functions that get called later
    const taskList = this.tasks.map(task => callback => {
      this.attemptMetadataParse(() => {
        const opts = {
          api: this.api,
          packagesDir: this.packagesDir,
          completedTaskHashList: this.diary.completedTasks,
          metadata: this.metadata,
          relPath: this.relPath,
          command: task.command,
          cwd: this.watchPath,
          match: task.match,
          path: this.path,
          args: task.args,
        }

        const t = new Task({
          ...opts,
          on_log: (tt, m) => {
            this.on_log(`${m}`)
          },
          on_complete: (tt) => {
            this.logTask(tt.print())
            this.extendDiary({ response: tt._response })
            this.on_task_complete(tt)
            setTimeout(() => { callback() })
          },
          on_error: (tt, error) => {
            setTimeout(() => { callback(error) })
          }
        })

        t.ready(() => {
          if (!t.ignored) {
            this.on_task_start(task)
            t.run()
          } else {
            this.on_task_start(task)
            this.on_task_ignore(t)
            setTimeout(() => { callback() })
          }
        })
      })
    })

    // pass them to the queue
    // if any of the tasks fail, the queue is killed and the error is returned
    scheduler.pipelineQueue.push(scheduler.createQueue(taskList), (err) => {
      if (err) {
        if (!this.retry) {
          return this.on_error(err)
        } else { // eslint-disable-line
          return this.tryAgain()
        }
      }
      return this.attemptMetadataParse(() => {
        this.extendDiary({ finished: true })
        this.writeDiary(() => {
          this.on_complete()
        })
      })
    })
  }

  tryAgain() {
    this.on_log('Pipeline failed')
    this.on_log(`Retrying in ${countdown} seconds`)

    this.timeout = this.timeout === 1 ? 2 : this.timeout * 2
    let countdown = this.timeout
    const interval = setInterval(() => {
      countdown = countdown - 1
      if (countdown === 0) {
        this.on_log('Retrying now')
        clearInterval(interval)
        this.run()
      } else {
        this.on_log(`Retrying in ${countdown} seconds`)
      }
    }, 1000)
  }
}
