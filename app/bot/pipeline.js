import { Task } from './task'
import async from 'async'
import _ from 'lodash'
import pt from 'path'
import { isMatch } from './utils'
import { readCreated } from './history'

export const jobCallback = (jobQueue, err) => {
  if (err) {
    const drain = jobQueue.drain
    jobQueue.kill()
    drain(err)
  }
}


export const createQueue = (funcArray) => (pipelineCallback) => {
  const jobQueue = new async.queue(function (job, callback) { // eslint-disable-line
    job(callback)
  }, 1)

  jobQueue.drain = pipelineCallback
  jobQueue.push(funcArray, jobCallback.bind(null, jobQueue))
  return jobQueue
}


export const queue = async.queue((job, callback) => {
  job(callback)
}, 1)


const createPipeline = (opts) => {
  /*
    Usage

      createPipeline(options)

    Where `options` contains

      createPipeline({
        pluginsDir: directory to plugins
        apiToken: rinobot api access token
        filepath: path to current file
        baseDir: dir being watched by rinobot
        config: config containing a list of tasks and metadata only
        onTaskStart: (task) => {},
        onTaskLog: (task, log) => {},
        onTaskComplete: (task) => {},
        onTaskIgnore: (task) => {},
        onTaskError: (task, error) => {},
        onError: (error) => {}
      })
  */

  const createdFilePath = pt.join(opts.baseDir, '.rino', 'created.json')
  const pipelines = opts.config.pipelines

  readCreated(createdFilePath, (err, createdList) => {
    _.map(pipelines, (pipeline) => {
      const { filematch, tasks } = pipeline
      let inputFile = opts.filepath

      if (
        createdList &&
        createdList.includes(inputFile) &&
        pipeline.incoming_only
      ) return

      let _break = false
      const taskList = _.map(tasks, (taskConfig, index) => finished => {
        // break out of this task list map
        if (_break) return finished()

        let badMatch = false
        if (index === 0) {
          if (!isMatch(filematch, pt.basename(inputFile))) {
            badMatch = true
          }
        }

        const task = new Task({
          filepath: inputFile,
          pluginsDir: opts.pluginsDir,
          baseDir: opts.baseDir,
          command: taskConfig.name,
          match: filematch,
          keep: taskConfig.keep,
          args: taskConfig.args,
          logOnly: badMatch,
          apiToken: opts.apiToken,
          onLog: (_task, message) => {
            opts.onTaskLog(_task, message)
          },
          onComplete: () => {
            if (task.outputFilename) {
              inputFile = pt.join(
                pt.dirname(task.filepath),
                task.outputFilename
              )
            } else {
              _break = true
            }

            opts.onTaskComplete(task)
            setTimeout(() => { finished() })
          },
          onError: (_task, error) => {
            opts.onTaskError(_task, error)
            _break = true
            setTimeout(() => { finished() })
          }
        })

        task.ready(() => {
          if (!badMatch && !task.ignored) {
            opts.onTaskStart(task)
            task.run()
          } else if (!badMatch && task.ignored) {
            opts.onTaskIgnore(task)
            setTimeout(() => { finished() })
          } else {
            opts.onTaskIgnore(task)
            setTimeout(() => { finished() })
            _break = true
          }
        })
      })

      queue.push(createQueue(taskList), (err) => {
        if (err) return opts.onError(err)
      })
    })
  })
}


export default createPipeline
