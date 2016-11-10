import rpc from './rpc'
import * as uiActions from './actions/ui'
import * as fsActions from './actions/fs'
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
    // dispatch(watcher.stopAll())
    rpc.emit('init')
  })

  rpc.on('python version', args => dispatch(uiActions.pythonVersion(args)))

  rpc.on('rinobot version', args => {
    dispatch(uiActions.rinobotVersion(args))
    Raven.setExtraContext(args)
  })

  rpc.on('update available', ({ releaseNotes, releaseName }) => {
    dispatch(uiActions.updateAvailable({
      version: releaseName,
      notes: releaseNotes
    }))
  })

  rpc.on('unexpected error', error => dispatch(uiActions.errorToNotification(error)))

  // rpc.on('log', args => console.log(`>>> ${args}`))

  // rpc.on('watcher started', args => dispatch(watcher.watcherStarted(args)))

  // rpc.on('watcher ready', args => dispatch(watcher.watcherReady(args)))

  // rpc.on('watcher set total files', _.debounce(args =>
  //   dispatch(watcher.setTotalFiles(args)), 500, { leading: true, trailing: true }))

  // rpc.on('watcher set processed files', _.debounce(args =>
  //   dispatch(watcher.setProcessedFiles(args)), 500, { leading: true, trailing: true }))

  // rpc.on('set history', _.debounce(args =>
  //   dispatch(watcher.setHistory(args)), 500, { leading: true, trailing: true }))

  rpc.on('task complete', (args) => {
    dispatch(fsActions.setItemComplete(args.filepath))
    dispatch(fsActions.refreshDir())
  })

  rpc.on('task started', args => {
    console.log('task started', args)
    dispatch(fsActions.setItemStarted(args.filepath))
  })

  rpc.on('task ignore', args => {
    console.log('task ignore', args)
  })

  rpc.on('task log', args => {
    dispatch(fsActions.setItemLog({
      path: args.filepath,
      log: args.log
    }))
  })

  rpc.on('task error', args => {
    console.log('task error', args)
    dispatch(fsActions.setItemError(args.filepath))
    dispatch(uiActions.errorToNotification(args.error))
  })
}
