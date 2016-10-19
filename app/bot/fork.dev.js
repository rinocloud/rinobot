import _ from 'lodash'
import rpc from './rpc-fork'
import chokidar from 'chokidar'
import moment from 'moment'
import createPipeline from './pipeline/pipeline'
import { flattenWatched } from './utils'

const forkRpc = rpc(process)

const watchers = {}
let processedFiles = {}
let timer

forkRpc.on('watch', (opts) => {
  const { apiToken, config, path, index, pluginsDir } = opts // path is folder path

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
      timer = setTimeout(add(watcher, { apiToken, config, index, baseDir: path, pluginsDir }), 500)
    })
    .on('change', () => {
      clearTimeout(timer)
      timer = setTimeout(add(watcher, { apiToken, config, index, baseDir: path, pluginsDir }), 500)
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

forkRpc.on('unwatch all', () => {
  _.each(watchers, (val) => {
    val.close()
  })
  processedFiles = {}
})

const add = (watcher, arg) => () => {
  const allFiles = flattenWatched(watcher.getWatched())
  forkRpc.emit('watcher set total files', { index: arg.index, numFiles: allFiles.length })

  _.each(allFiles, (filepath) => {
    if (!processedFiles[arg.index].includes(filepath)) {
      processFile(arg.index, { ...arg, filepath })
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
  const { filepath, baseDir, pluginsDir, apiToken, config } = opts
  createPipeline({
    pluginsDir,
    apiToken,
    filepath,
    baseDir,
    config,

    onTaskStart: (task) => {
      taskStart(index, task)
    },

    onTaskLog: (task, log) => {
      taskLog(index, task, log)
    },

    onTaskComplete: (task) => {
      taskComplete(index, task)
      finishedFile(index, filepath)
    },

    onTaskIgnore: (task) => {
      taskIgnore(index, task)
      finishedFile(index, filepath)
    },

    onTaskError: (task, error) => {
      taskError(index, task, error)
      finishedFile(index, filepath)
    },

    onError: (error) => {
      unexpectedError(index, error)
      finishedFile(index, filepath)
    }

  })
}

const finishedFile = (index, filepath) => {
  if (!processedFiles[index].includes(filepath)) {
    processedFiles[index].push(filepath)
  }

  forkRpc.emit('watcher set processed files', {
    index,
    numFiles: processedFiles[index].length
  })
}

const taskStart = (index, task) => {
  forkRpc.emit('set history', { index, history: task.history })

  forkRpc.emit(
    'task started',
    {
      index,
      filepath: task.filepath,
      relativePath: task.relativePath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString()
    }
  )
}

const taskLog = (index, task, log) => {
  forkRpc.emit(
    'task log',
    {
      index,
      log,
      filepath: task.filepath,
      relativePath: task.relativePath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString()
    }
  )
}

const taskComplete = (index, task) => {
  forkRpc.emit('set history', { index, history: task.history })

  forkRpc.emit(
    'task complete',
    {
      index,
      filepath: task.filepath,
      relativePath: task.relativePath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString()
    }
  )
}

const taskIgnore = (index, task) => {
  forkRpc.emit('set history', { index, history: task.history })

  forkRpc.emit(
    'task ignore',
    {
      index,
      filepath: task.filepath,
      relativePath: task.relativePath,
      command: task.command,
      args: task.args,
      match: task.match,
      datetime: moment().toISOString()
    }
  )
}

const taskError = (index, task, error) => {
  forkRpc.emit('set history', { index, history: task.history })
  forkRpc.emit(
    'task error',
    {
      index,
      filepath: task.filepath,
      relativePath: task.relativePath,
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
