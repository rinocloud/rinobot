import _ from 'lodash'
import rpc from './rpc-fork'
import chokidar from 'chokidar'
import moment from 'moment'
import { Pipeline } from './pipeline'
import { flattenWatched } from './utils'

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
      ignored: ['**.rino**', '**.rino/**', '**.rino', '**/.rino', /[\/\\]\./, '.DS_Store'],
      ignoreInitial: false,
      usePolling: true
    })
    .on('add', () => {
      clearTimeout(timer)
      timer = setTimeout(add(watcher, { index, watchPath: path, packagesDir }), 0)
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
  const allFiles = flattenWatched(watcher.getWatched())
  forkRpc.emit('watcher set total files', { index: arg.index, numFiles: allFiles.length })
  _.each(allFiles, (file) => {
    console.log(file, !processedFiles[arg.index].includes(file))
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

const processFile = (index, opts) => {
  const { path, watchPath, packagesDir } = opts

  const pipeline = new Pipeline({
    packagesDir,
    watchPath,
    path,

    on_task_start: (pipe, task) => {
      console.log('starting task', pipe.relPath, task.command)
      taskStart(index, pipe, task)
    },

    on_task_log: (pipe, task, log) => {
      taskLog(index, pipe, task, log)
    },

    on_task_complete: (pipe, task) => {
      console.log('completed task', pipe.relPath, task.command)
      taskComplete(index, pipe, task)
      finishedFile(index, path)
    },

    on_task_ignore: (pipe, task) => {
      console.log('ignored task', pipe.relPath, task.command)
      taskIgnore(index, pipe, task)
      finishedFile(index, path)
    },

    on_task_error: (pipe, task) => {
      console.log('error task', pipe.relPath, task.command)
      taskError(index, pipe, task)
      finishedFile(index, path)
    },

    on_error: (pipe, error) => {
      unexpectedError(error)
      finishedFile(index, path)
    }

  })

  pipeline.ready(() => {
    if (!pipeline.ignored) {
      pipeline.run()
    } else {
      finishedFile(index, path)
    }
  })
}

const finishedFile = (index, path) => {
  if (!processedFiles[index].includes(path)) {
    processedFiles[index].push(path)
  }

  forkRpc.emit('watcher set processed files', {
    index,
    numFiles: processedFiles[index].length
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
