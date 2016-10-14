import { createTask } from './task'
import async from 'async'
import _ from 'lodash'
import pt from 'path'
import { isMatch } from './utils'
import { readCreated } from './history'


export const queue = async.queue((job, callback) => job(callback), 1)


export const sortTasks = (tasks) => {
  const sortedTasks = []
  let currentRow = []
  _.each(tasks, (task, index) => {
    let nextTask = null
    if (index < tasks.length - 1) {
      nextTask = tasks[index + 1]
    }
    currentRow.push(task)
    if (nextTask && (nextTask.flow === 'then' || nextTask.flow === null)) {
      sortedTasks.push(currentRow)
      currentRow = []
    } else if (!nextTask) {
      sortedTasks.push(currentRow)
    }
  })

  return sortedTasks
}


const createTaskQueue = (pipeline, opts, callback) => {
  const sortedTasks = sortTasks(pipeline.tasks)
  let inputFiles = [opts.filepath]

  const mapInputFiles = (taskConfig, outputFiles) =>
    _.flatMap(inputFiles, (inputFile) => subFinished => {
      const onComplete = (task, err) => {
        if (err) {
          opts.onTaskError(task, err)
          return setTimeout(() => { subFinished(false) })
        }
        opts.onTaskComplete(task)
        if (task.outputFilename) {
          const outputFile = pt.join(pt.dirname(task.filepath), task.outputFilename)
          outputFiles.push(outputFile)
          setTimeout(() => { subFinished(true) })
        } else {
          setTimeout(() => { subFinished(false) })
        }
      }

      createTask({
        filepath: inputFile,
        pluginsDir: opts.pluginsDir,
        baseDir: opts.baseDir,
        apiToken: opts.apiToken,
        onLog: opts.onTaskLog,
        command: taskConfig.name,
        keep: taskConfig.keep,
        args: taskConfig.args,
        onComplete
      })
      .ready((task) => {
        if (!task.ignored) {
          opts.onTaskStart(task)
          task.run()
        } else {
          opts.onTaskIgnore(task)
          setTimeout(() => { subFinished(true) })
        }
      })
    })

  const buildBatch = (taskBatch) => finished => {
    const outputFiles = []
    const batch = _.flatMap(taskBatch, (taskConfig) => mapInputFiles(taskConfig, outputFiles))

    const subQueue = async.queue((job, cb) => job(cb), 1)
    subQueue.drain = () => {
      inputFiles = outputFiles
      finished(true)
    }

    subQueue.push(batch, (_continue) => {
      if (_.isError(_continue) || _continue === false) {
        const drain = queue.drain
        subQueue.kill()
        drain(_continue)
      }
    })
    return batch
  }

  const taskList = _.flatMap(sortedTasks, buildBatch)

  callback(taskList)
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
        /* TODO: return proper onTaskIgnore */
        return
      }

      createTaskQueue(pipeline, opts, (taskList) => {
        queue.push(taskList, (_continue) => {
          if (_.isError(_continue) || _continue === false) {
            const drain = queue.drain
            queue.kill()
            drain(_continue)
          }
        })
      })
    })
  })
}


export default createPipeline
