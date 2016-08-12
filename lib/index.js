window.Raven.config(
  'https://140838b87a124da883424d7935b61743@app.getsentry.com/91879',
  {
    environment: process.env.NODE_ENV,
    release: window.rinobotVersion
  }
).install()

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import rpc from './rpc'
import routes from './routes'
import * as actions from './actions/index'
import * as watcherActions from './actions/watcher'
import * as uiActions from './actions/ui'
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
  store.dispatch(uiActions.updateAvailable({
    version: releaseName,
    notes: releaseNotes
  }))
})

rpc.on('rinobot version', args => {
  store.dispatch(uiActions.rinobotVersion(args))
  if (window.Raven) window.Raven.setExtraContext(args)
})

rpc.on('python version', args => store.dispatch(uiActions.pythonVersion(args)))

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
