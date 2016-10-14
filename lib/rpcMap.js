import _ from 'lodash'
import rpc from './rpc'
import * as watcher from './actions/watcher'
import * as ui from './actions/ui'
import Raven from 'raven-js'

/*
  RPC is how we communicate between the
  window and the main electron process.
  Example

    rpc.on('some event', (args) => {
      // do something based on event
    })

  can also emit events

    rpc.emit('some command', someArgs)

  It handles things like starting the watcher,
  running tasks, checking if python is installed.

  In this file we map the rpc events to the redux actions
*/


export default (dispatch) => {
  rpc.on('ready', () => {
    dispatch(watcher.stopAll())
    rpc.emit('init')
  })

  rpc.on('python version', args => dispatch(ui.pythonVersion(args)))

  rpc.on('rinobot version', args => {
    dispatch(ui.rinobotVersion(args))
    Raven.setExtraContext(args)
  })

  rpc.on('update available', ({ releaseNotes, releaseName }) => {
    dispatch(ui.updateAvailable({
      version: releaseName,
      notes: releaseNotes
    }))
  })

  rpc.on('error', error => dispatch(ui.setError(error)))

  rpc.on('log', args => console.log(`>>> ${args}`))

  rpc.on('unexpected error', error => dispatch(ui.setError(error)))

  rpc.on('watcher started', args => dispatch(watcher.watcherStarted(args)))

  rpc.on('watcher ready', args => dispatch(watcher.watcherReady(args)))

  rpc.on('watcher set total files', _.debounce(args =>
    dispatch(watcher.setTotalFiles(args)), 500, { leading: true, trailing: true }))

  rpc.on('watcher set processed files', _.debounce(args =>
    dispatch(watcher.setProcessedFiles(args)), 500, { leading: true, trailing: true }))

  rpc.on('set history', _.debounce(args =>
    dispatch(watcher.setHistory(args)), 500, { leading: true, trailing: true }))

  rpc.on('task complete', args => dispatch(watcher.taskComplete(args)))

  rpc.on('task started', args => dispatch(watcher.taskStarted(args)))

  rpc.on('task ignore', args => dispatch(watcher.taskIgnore(args)))

  rpc.on('task log', args => dispatch(watcher.taskLog(args)))

  rpc.on('task error', _.debounce(args =>
    dispatch(watcher.taskError(args)), 0, { leading: true, trailing: true }))
}
