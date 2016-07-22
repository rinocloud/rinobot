

import _ from 'lodash'
import rpc from './rpc-fork'
import chokidar from 'chokidar'
import { Pipeline } from './bot/src/pipeline'
import { countWatched, flattenWatched } from './bot/src/utils'

const watchers = {}
const processedFiles = {}
let timer
const logs = {}
const timers = {}
const last = {}
const time = 1000
const forkRpc = rpc(process)

const processFile = function processFile(index, path, watchPath, event) { // eslint-disable-line
  const pipeline = new Pipeline({
    watchPath,
    path,
    on_complete: (pipe) => {
      processedFiles[index].push(path)
      setProcessedFiles(index, processedFiles[index].length)
      pipelineComplete(index, pipe)
    },
    on_log: pipelineLog.bind(null, index),
    on_error: (pipe, error) => {
      processedFiles[index].push(path)
      setProcessedFiles(index, processedFiles[index].length)
      pipelineError(index, pipe, error)
    }
  })

  pipeline.ready(() => {
    if (!pipeline.ignored) {
      pipelineStarted(index)
      pipeline.run()
    } else {
      processedFiles[index].push(path)
      setProcessedFiles(index, processedFiles[index].length)
    }
  })
}

const addAfterTimeout = function addAfterTimeout(watcher, index, watchPath, event) {
  clearTimeout(timer)
  timer = setTimeout(add(watcher, index, watchPath, event), 200)
}

const add = (watcher, index, watchPath, event) => () => {
  const numFiles = countWatched(watcher.getWatched())
  setTotalFiles(index, numFiles)

  const allFiles = flattenWatched(watcher.getWatched())
  _.each(allFiles, (file) => {
    if (!processedFiles[index].includes(file)) {
      processFile(index, file, watchPath, event)
    }
  })
}

const ready = (watcher, index, t0) => {
  const t1 = new Date()
  watcherReady(index, t1 - t0)

  const numFiles = countWatched(watcher.getWatched())
  setTotalFiles(index, numFiles)
  setProcessedFiles(index, 0)
}

const startWatcher = function startWatcher({ path, index }) {
  if (!_.has(processedFiles, index)) processedFiles[index] = []
  if (!_.has(logs, index)) logs[index] = []

  watcherStarted(index)
  const t0 = new Date()
  const watcher = chokidar.watch(path, {
    ignored: ['**.rino**', '**.rino/**', '**.rino', '**/.rino', '/[\\]./'],
    ignoreInitial: false,
    usePolling: true
  }).on('add', function () {
    addAfterTimeout(this, index, path, 'add')
  }).on('ready', function () {
    ready(this, index, t0)
  })
  watchers[index] = watcher
}

const stopWatcher = function stopWatcher({ index }) {
  watchers[index].close()
  processedFiles[index] = []
}

forkRpc.on('watch', startWatcher)
forkRpc.on('unwatch', stopWatcher)

const watcherReady = (args) => forkRpc.emit('watcher ready', args)
const watcherStarted = (args) => forkRpc.emit('watcher started', args)

const setTotalFiles = _.throttle((index, numFiles) => {
  if (!watchers[index].closed) forkRpc.emit('watcher set total files', { index, numFiles })
}, 200)

const setProcessedFiles = _.throttle((index, numFiles) => {
  if (!watchers[index].closed) forkRpc.emit('watcher set processed files', { index, numFiles })
}, 200)

const pipelineStarted = _.throttle((index) => {
  if (!watchers[index].closed) forkRpc.emit('pipeline started', { index })
}, 200)

const pipelineComplete = _.throttle((index, pipe) => {
  if (!watchers[index].closed) forkRpc.emit('pipeline complete', { index, pipePath: pipe.relPath })
}, 200)

const pipelineError = _.throttle((index, pipe, error) => {
  if (!watchers[index].closed) {
    forkRpc.emit('pipeline error', { index, error, pipePath: pipe.relPath })
  }
}, 200)

const pipelineLog = function pipelineLog(index, pipe, log) {
  const task = () => {
    if (logs[index].length === 0) return
    if (!watchers[index].closed) forkRpc.emit('pipeline log', { index, logs: logs[index] })
    logs[index] = []
  }

  if (!_.has(logs, index)) {
    logs[index] = []
  }
  if (timers[index]) {
    clearTimeout(timers[index])
  }

  logs[index].push(log)
  const now = new Date().getTime()
  if (last[index] && now < last[index] + time) {
    timers[index] = setTimeout(task, time)
  } else {
    last[index] = now
    task()
  }
}

forkRpc.emit('ready')
