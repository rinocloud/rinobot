/* eslint-disable */
var pt = require('path')
var _ = require('lodash')
var chokidar = require('chokidar')
var Pipeline = require('./bot/src/pipeline').Pipeline
import IPC from 'ipc-event-emitter'

var countWatched = function countWatched(_watched) {
	var numFiles = _.reduce(_watched, function (result, value, key) {
		var f = _.reduce(value, function (r, v) {
			return _watched.hasOwnProperty(pt.join(key, v)) ? r + 1 : r + 0
		}, 0)
		return result + value.length - f
	}, 0)
	return numFiles
}

var flattenWatched = function flattenWatched(_watched) {
	return _.flatten(_.map(_watched, function (relPaths, basePath) {
		return _.reduce(relPaths, function (arr, relPath) {
			var d = pt.join(basePath, relPath)
			if (!_watched.hasOwnProperty(d)) {
				arr.push(d)
			}
			return arr
		}, [])
	}))
}

var watchers = {}
var processedFiles = {}
var timer = void 0
var logs = {}
var timers = {}
var last = {}
var time = 1000
let ipc = IPC(process)

var addAfterTimeout = function addAfterTimeout(watcher, index, watchPath, event) {
  clearTimeout(timer)
  timer = setTimeout(add(watcher, index, watchPath, event), 200)
}

var processFile = function processFile(index, path, watchPath, event) {
  var pipeline = new Pipeline({
    watchPath: watchPath,
    path: path,
    on_complete: function on_complete(pipe) {
      processedFiles[index].push(path)
      setProcessedFiles(index, processedFiles[index].length)
      pipelineComplete(index, pipe)
    },
    on_log: pipelineLog.bind(null, index),
    on_error: function on_error(pipe, error) {
      processedFiles[index].push(path)
      setProcessedFiles(index, processedFiles[index].length)
      pipelineError(index, pipe, error)
    }
  })

  pipeline.ready(function () {
    if (!pipeline.ignored) {
      pipelineStarted(index)
      pipeline.run()
    } else {
      processedFiles[index].push(path)
      setProcessedFiles(index, processedFiles[index].length)
    }
  })
}

var add = function add(watcher, index, watchPath, event) {
  return function () {
    var numFiles = countWatched(watcher.getWatched())
    setTotalFiles(index, numFiles)

    var allFiles = flattenWatched(watcher.getWatched())
    _.each(allFiles, function (file) {
      if (!processedFiles[index].includes(file)) {
        processFile(index, file, watchPath, event)
      }
    })
  }
}

var ready = function ready(watcher, index, t0) {
  var t1 = new Date()

  watcherReady(index, t1 - t0)

  var numFiles = countWatched(watcher.getWatched())
  setTotalFiles(index, numFiles)
  setProcessedFiles(index, 0)
}

var startWatcher = function startWatcher(_ref) {
  var path = _ref.path
  var index = _ref.index

  if (!processedFiles.hasOwnProperty(index)) {
    processedFiles[index] = []
  }

  if (!logs.hasOwnProperty(index)) {
    logs[index] = []
  }

  watcherStarted(index)
  var t0 = new Date()
  var watcher = chokidar.watch(path, {
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

var stopWatcher = function stopWatcher(_ref2) {
  var index = _ref2.index

  watchers[index].close()
  processedFiles[index] = []
}

ipc.on('watch', startWatcher)
ipc.on('unwatch', stopWatcher)

var watcherReady = function watcherReady(index, delta) {
  ipc.emit('watcher ready', { index: index, delta: delta })
}

var watcherStarted = function watcherStarted(index) {
  ipc.emit('watcher started', { index: index })
}

var setTotalFiles = _.throttle(function (index, numFiles) {
  if (!watchers[index].closed) ipc.emit('watcher set total files', { index: index, numFiles: numFiles })
}, 200)

var setProcessedFiles = _.throttle(function (index, numFiles) {
  if (!watchers[index].closed) ipc.emit('watcher set processed files', { index: index, numFiles: numFiles })
}, 200)

var pipelineStarted = _.throttle(function (index, pipe) {
  if (!watchers[index].closed) ipc.emit('pipeline started', { index: index })
}, 200)

var pipelineComplete = _.throttle(function (index, pipe) {
  if (!watchers[index].closed) ipc.emit('pipeline complete', { index: index, pipePath: pipe.relPath })
}, 200)

var pipelineError = _.throttle(function (index, pipe, error) {
  if (!watchers[index].closed) {
    ipc.emit('pipeline error', { index: index, error: error, pipePath: pipe.relPath })
  }
}, 200)

var pipelineLog = function pipelineLog(index, pipe, log) {
  var task = function task() {
    if (logs[index].length === 0) return

    if (!watchers[index].closed) ipc.emit('pipeline log', { index: index, logs: logs[index] })
    logs[index] = []
  }

  if (!_.has(logs, index)) {
    logs[index] = []
  }

  if (timers[index]) {
    clearTimeout(timers[index])
  }

  logs[index].push(log)

  var now = new Date().getTime()
  if (last[index] && now < last[index] + time) {
    timers[index] = setTimeout(task, time)
  } else {
    last[index] = now
    task()
  }
}

ipc.fix('ready')
