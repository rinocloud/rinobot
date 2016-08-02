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
  - on_task_error: function (pipeline, task, err), called when a task fails
  - on_task_ignore: function (pipeline, task, reason), called if the task has alredy
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

  ready(readyFunc){
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
      ], function(){
        this.readyFunc()
      }.bind(this))
    })
  }

  setUpLogging(options) {
    this.on_complete = options.on_complete ? options.on_complete.bind(null, this) : function () {}
    this.on_error = options.on_error ? options.on_error.bind(null, this) : function (e) { throw e }

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

    const matchesNone = _.every(this.tasks, task => {
      return !globule.isMatch(task.match, this.filename)
    })

    if(matchesNone){
      this.on_ignore('Matches no tasks')
      this.ignored = true
    }

    const allCompleted = _.every(this.tasks, (task) => {
      return this.diary.completedTasks.hasOwnProperty(task.command)
    })

    if(allCompleted){
      this.on_ignore('All tasks completed')
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
      this.on_error(new Error(`${globResults.length} conflicting metadata files. Should only be one.`))
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

            const self = this
            this.api
              .updateMerge(dataFileDiary.response.id, _.cloneDeep(this.metadata))
              .then((response) => {
                _.extend(dataFileDiary, { response })
                _.extend(dataFileDiary, { metadata: response.metadata })
                mkdirp(pt.dirname(dataFileHiddenMetadataFile), (err) => {
                  if (err) return self.on_error(err)
                  const metadataString = JSON.stringify(dataFileDiary, null, 4)
                  fs.writeFile(dataFileHiddenMetadataFile, metadataString, self.on_complete)
                })
              })
              .catch((err) => {
                self.on_error(err)
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
    this.diary.completedTasks[task.command] = task
  }

  run() {
    const self = this
    // lets make a list of functions that get called later
    const taskList = this.tasks.map((task) => (callback) => {

      if (self.diary.completedTasks.hasOwnProperty(task.command)) {
        self.on_ignore(`${task.command}: already complete`)
        return callback()
      }

      self.attemptMetadataParse(() => {
        const opts = {
          api: self.api,
          packagesDir: self.packagesDir,
          metadata: self.metadata,
          relPath: self.relPath,
          command: task.command,
          cwd: self.watchPath,
          match: task.match,
          path: self.path,
          args: task.args,
        }

        const t = new Task({
          ...opts,
          on_ignore: (tt, m) => {
            self.on_ignore(`${tt.command}: ${m}`)
            setTimeout(() => { callback() })
          },
          on_log: (tt, m) => {
            self.on_log(`${m}`)
          },
          on_complete: (tt) => {
            self.on_log(`${tt.command}: finished`)
            self.logTask(tt.print())
            self.extendDiary({ response: tt._response })
            setTimeout(() => { callback() })
          },
          on_error: (tt, error) => {
            setTimeout(() => { callback(error) })
          }
        })

        if (!t.ignored) {
          t.run()
        }
      })
    })

    // pass them to the queue
    // if any of the tasks fail, the queue is killed and the error is returned
    scheduler.pipelineQueue.push(scheduler.createQueue(taskList), (err) => {
      if (err) {
        if (!self.retry) {
          return self.on_error(err)
        } else { // eslint-disable-line
          return self.tryAgain()
        }
      }
      return self.attemptMetadataParse(() => {
        self.extendDiary({ finished: true })
        self.writeDiary(() => {
          self.on_complete()
        })
      })
    })
  }

  tryAgain() {
    const self = this
    self.on_log('Pipeline failed')
    self.on_log(`Retrying in ${countdown} seconds`)

    self.timeout = self.timeout === 1 ? 2 : self.timeout * 2
    let countdown = self.timeout
    const interval = setInterval(() => {
      countdown = countdown - 1
      if (countdown === 0) {
        self.on_log('Retrying now')
        clearInterval(interval)
        self.run()
      } else {
        self.on_log(`Retrying in ${countdown} seconds`)
      }
    }, 1000)
  }
}
