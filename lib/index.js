import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import rpc from './rpc'
import routes from './routes'
import * as actions from './actions/index'
import * as watcherActions from './actions/watcher'
import * as updaterActions from './actions/updater'
import configureStore from './store/configureStore'

import './css/font-awesome.css'
import './css/toolkit-startup.css'
import './css/application-startup.css'
import './css/rinocloud-icons.css'
import './css/rinobot.css'

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

store.dispatch(actions.startup())

rpc.on('ready', () => {
  rpc.emit('init')
})

rpc.on('update available', ({ releaseNotes, releaseName }) => {
  store.dispatch(updaterActions.updateAvailable({
    version: releaseName,
    notes: releaseNotes
  }))
})

rpc.on('error', error => store.dispatch(watcherActions.setError(error)))

rpc.on('watcher error', error => store.dispatch(watcherActions.setError(error)))

rpc.on('child closed', error => store.dispatch(watcherActions.setError(error)))

rpc.on('watcher started', args => store.dispatch(watcherActions.watcherStarted(args)))

rpc.on('watcher ready', args => store.dispatch(watcherActions.watcherReady(args)))

rpc.on('watcher set total files', args => store.dispatch(watcherActions.setTotalFiles(args)))

rpc.on('watcher set processed files', args => store.dispatch(watcherActions.setProcessedFiles(args))) // eslint-disable-line

rpc.on('pipeline started', args => store.dispatch(watcherActions.pipelineStarted(args)))

rpc.on('pipeline complete', args => store.dispatch(watcherActions.pipelineComplete(args)))

rpc.on('pipeline log', args => store.dispatch(watcherActions.pipelineLog(args)))

rpc.on('pipeline error', args => store.dispatch(watcherActions.pipelineError(args)))

rpc.on('log', args => console.log(`>>> ${args}`))

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
)
