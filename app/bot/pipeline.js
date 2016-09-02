import { queue, createQueue } from './scheduler'
import { Task } from './task'

export default (opts) => {
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
