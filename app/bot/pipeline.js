import { Task } from './task'
import async from 'async'
import _ from 'lodash'
import pt from 'path'
import { isMatch } from './utils'
import { readCreated } from './history'


export const queue = async.queue((job, callback) => job(callback), 1)


const createTaskQueue = (pipeline, opts) => {
  const { filematch, tasks } = pipeline
  let inputFile = opts.filepath

  const taskList = _.map(tasks, (taskConfig) => finished => {
    // let badMatch = false
    // if (index === 0) {
    //   if (!isMatch(filematch, pt.basename(inputFile))) {
    //     badMatch = true
    //   }
    // }

    const onLog = (_task, message) => {
      opts.onTaskLog(_task, message)
    }

    const onComplete = () => {
      if (task.outputFilename) {
        inputFile = pt.join(
          pt.dirname(task.filepath),
          task.outputFilename
        )
        opts.onTaskComplete(task)
        setTimeout(() => { finished(true) })
      } else {
        opts.onTaskComplete(task)
        setTimeout(() => { finished(false) })
      }
    }

    const onError = (_task, error) => {
      opts.onTaskError(_task, error)
      setTimeout(() => { finished(false) })
    }

    const taskProcess = (task) => {
      if (/* !badMatch && */ !task.ignored) {
        opts.onTaskStart(task)
        task.run()
      } else if (/* !badMatch && */ task.ignored) {
        opts.onTaskIgnore(task)
        setTimeout(() => { finished(true) })
      }
      // else {
      //   opts.onTaskIgnore(task)
      //   setTimeout(() => { finished(false) })
      // }
    }

    const task = new Task({
      filepath: inputFile,
      pluginsDir: opts.pluginsDir,
      baseDir: opts.baseDir,
      command: taskConfig.name,
      match: filematch,
      keep: taskConfig.keep,
      args: taskConfig.args,
      apiToken: opts.apiToken,
      onLog,
      onComplete,
      onError
    })

    task.ready(() => {
      taskProcess(task)
    })
  })

  return taskList
}


const createPipeline = (opts) => {
  const createdFilePath = pt.join(opts.baseDir, '.rino', 'created.json')
  const pipelines = opts.config.pipelines

  readCreated(createdFilePath, (err, createdList) => {
    _.map(pipelines, (pipeline) => {
      if (
        createdList &&
        createdList.includes(opts.filepath) &&
        pipeline.incoming_only
      ) {
        return
      }

      if (!isMatch(pipeline.filematch, pt.basename(opts.filepath))) {
        /*
          TODO: return proper onTaskIgnore
        */
        return
      }

      const taskList = createTaskQueue(pipeline, opts)

      queue.push(taskList, (_continue) => {
        if (_.isError(_continue) || _continue === false) {
          const drain = queue.drain
          queue.kill()
          drain(_continue)
        }
      })
    })
  })
}


export default createPipeline
