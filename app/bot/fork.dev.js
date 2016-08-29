import _ from 'lodash'
import rpc from './rpc-fork'
import chokidar from 'chokidar'
import moment from 'moment'
import { Pipeline } from './pipeline'
import { countWatched, flattenWatched } from './utils'

/*
  only emits events

    'watcher started'
    'watcher ready'
    'watcher set total files'
    'watcher set processed files'

    'task started'
    'task log'
    'task complete'
    'task ignore'
    'task error'
    'unexpected error'
*/

const forkRpc = rpc(process)

const watchers = {}
const processedFiles = {}
let timer

forkRpc.on('watch', ({ path, index, packagesDir = null }) => {
  if (!_.has(processedFiles, index)) processedFiles[index] = []

  forkRpc.emit('watcher started', { index })
  const t0 = new Date()

  const watcher = chokidar
    .watch(path, {
      ignored: ['**.rino**', '**.rino/**', '**.rino', '**/.rino', '/[\\]./', '.DS_Store'],
      ignoreInitial: false,
      usePolling: true
    })
    .on('add', () => {
      clearTimeout(timer)
      timer = setTimeout(add(watcher, { index, watchPath: path, packagesDir }), 200)
    })
    .on('ready', () => {
      ready(this, index, t0)
    })

  watchers[index] = watcher
})

forkRpc.on('unwatch', ({ index }) => {
  if (watchers[index]) watchers[index].close()
  processedFiles[index] = []
})

const add = (watcher, arg) => () => {
  const numFiles = countWatched(watcher.getWatched())

  forkRpc.emit('watcher set total files', { index: arg.index, numFiles })

  const allFiles = flattenWatched(watcher.getWatched())
  _.each(allFiles, (file) => {
    if (!processedFiles[arg.index].includes(file)) {
      processFile(arg.index, { ...arg, path: file })
    }
  })
}

const ready = (watcher, index, t0) => {
  const t1 = new Date()
  forkRpc.emit('watcher ready', { index, delta: t1 - t0 })
  forkRpc.emit('watcher set processed files', {
    index,
    numFiles: 0
  })
}

const processFile = function processFile(index, opts) {
  const { path, watchPath, packagesDir } = opts

  const pipeline = new Pipeline({
    packagesDir,
    watchPath,
    path,

    on_task_start: (pipe, task) => {
      taskStart(index, pipe, task)
    },

    on_task_complete: (pipe, task) => {
      taskComplete(index, pipe, task)
    },

    on_task_ignore: (pipe, task) => {
      taskIgnore(index, pipe, task)
    },

    on_task_error: (pipe, task) => {
      taskError(index, pipe, task)
    },

    on_task_log: (pipe, task, log) => {
      taskLog(index, pipe, task, log)
    },

    on_error: (pipe, error) => {
      unexpectedError(error)
    }

  })

  pipeline.ready(() => {
    if (!pipeline.ignored) {
      pipeline.run()
    } else {
      processedFiles[index].push(path)
    }
  })
}


const taskStart = (index, pipe, task) => {
  forkRpc.emit(
    'task started',
    {
      index,
      filepath: pipe.relPath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString()
    }
  )
}

const taskLog = (index, pipe, task, log) => {
  forkRpc.emit(
    'task log',
    {
      index,
      log,
      filepath: pipe.relPath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString()
    }
  )
}

const taskComplete = (index, pipe, task) => {
  forkRpc.emit(
    'task complete',
    {
      index,
      filepath: pipe.relPath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString()
    }
  )
}

const taskIgnore = (index, pipe, task) => {
  forkRpc.emit(
    'task ignore',
    {
      index,
      filepath: pipe.relPath,
      command: task.command,
      args: task.args,
      match: task.match,
      reason: task.reason,
      datetime: moment().toISOString()
    }
  )
}

const taskError = (index, pipe, task, error) => {
  forkRpc.emit(
    'task error',
    {
      index,
      filepath: pipe.relPath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code || null,
        errno: error.errno || null,
        syscall: error.syscall || null,
        path: error.path || null,
      }
    }
  )
}

const unexpectedError = (index, error) => {
  forkRpc.emit(
    'unexpected error',
    {
      index,
      datetime: moment().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code || null,
      errno: error.errno || null,
      syscall: error.syscall || null,
      path: error.path || null,
    }
  )
}

forkRpc.emit('ready')
