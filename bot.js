import pt from 'path'
import _ from 'lodash'
import chokidar from 'chokidar'
import { Pipeline } from './bot/src/pipeline'

const count = (_watched) => { // eslint-disable-line
  const numFiles = _.reduce(_watched, (result, value, key) => {
    const f = _.reduce(value, (r, v) =>
      (_watched.hasOwnProperty(pt.join(key, v)) ? r + 1 : r + 0)
    , 0)
    return result + value.length - f
  }, 0)

  // subtract 1 because chokidar adds the parent dir too
  return numFiles - 1
}


export default function (rpc) {
  let watchers = []
  const processedFiles = {}

  const startWatcher = ({ path, index }) => {
    rpc.emit('watcher started', { index })
    const t0 = new Date()
    let timer
    let watcher = null

    const done = () => {
      // should have a list of files here
      watcher.getWatched()
    }

    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(done, 100);
    }

    watcher = chokidar
      .watch(path, {
        ignored: ['**.rino**', '**.rino/**', '**.rino', '**/.rino', '/[\\]./'],
        ignoreInitial: false,
        usePolling: true
      })
      .on('add', handler)
      .on('ready', () => {
        const t1 = new Date()
        rpc.emit('watcher ready', { index, delta: t1 - t0 })

        const numFiles = count(watcher.getWatched())
        rpc.emit('watcher set total files', { index, numFiles })
      })

    watchers.push(watcher)
  }

  const queuePipeline = (watchPath, index, watcher) => { // eslint-disable-line
    return (eventPath) => {
      if (!processedFiles.hasOwnProperty(index)) {
        processedFiles[index] = []
      }

      if (!processedFiles[index].includes(eventPath.toString())) {
        processedFiles[index].push(eventPath.toString())
      }

      const numFiles = count(watcher.getWatched())
      rpc.emit('watcher set total files', { index, numFiles })
      rpc.emit('watcher set processed files', { index, numFiles: processedFiles.length - 1 })

      const pipeline = new Pipeline({
        watchPath,
        path: eventPath,
        on_complete: pipelineComplete.bind(null, index),
        on_log: pipelineLog.bind(null, index),
        on_error: pipelineError.bind(null, index),
      })

      if (!pipeline.ignored) {
        pipelineStarted(index)
        pipeline.run()
      }
    }
  }

  const stopWatcher = ({ index }) => {
    watchers[index].close()
    watchers = [
      ...watchers.slice(0, index),
      ...watchers.slice(index + 1),
    ]
  }

  const pipelineStarted = (index, pipe ) => { // eslint-disable-line
    rpc.emit('pipeline started', { index })
  }

  const pipelineComplete = (index, pipe ) => { // eslint-disable-line
    rpc.emit('pipeline complete', { index, pipePath: pipe.relPath })
  }

  const pipelineLog = (index, pipe, log) => { // eslint-disable-line
    rpc.emit('pipeline log', { index, log, pipePath: pipe.relPath })
  }

  const pipelineError = (index, pipe, error) => { // eslint-disable-line
    rpc.emit('pipeline error', { index, error, pipePath: pipe.relPath })
  }

  rpc.on('watch', startWatcher)
  rpc.on('unwatch', stopWatcher)
}
