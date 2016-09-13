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


import { Task } from './task'
import async from 'async'


const createPipeline = (opts) => {
  const taskList = opts.config.tasks.map(task => callback => {
    const t = new Task({
      filepath: opts.filepath,
      pluginsDir: opts.pluginsDir,
      baseDir: opts.baseDir,
      command: task.command,
      match: task.match,
      args: task.args,
      apiToken: opts.apiToken,

      onLog: (_task, message) => {
        opts.onTaskLog(_task, message)
      },

      onComplete: (_task) => {
        opts.onTaskComplete(_task)
        setTimeout(() => { callback() })
      },

      onError: (_task, error) => {
        opts.onTaskError(_task, error)
        setTimeout(() => { callback() })
      }

    })

    t.ready(() => {
      if (!t.ignored) {
        opts.onTaskStart(t)
        t.run()
      } else {
        opts.onTaskIgnore(t)
        setTimeout(() => { callback() })
      }
    })
  })

  queue.push(createQueue(taskList), (err) => {
    if (err) {
      return opts.onError(err)
    }
  })
}


export default createPipeline;


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
  }, 1);

  jobQueue.drain = pipelineCallback
  jobQueue.push(funcArray, jobCallback.bind(null, jobQueue))

  return jobQueue
}


export const queue = async.queue((job, callback) => {
  job(callback)
}, 1)
