import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import rpc from './rpc'
import routes from './routes'
import * as actions from './actions/index'
import * as watcherActions from './actions/watcher'
import configureStore from './store/configureStore'
import './app.global.css'

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

store.dispatch(actions.startup())

rpc.on('ready', () => {
  rpc.emit('init')
})

rpc.on('watcher started', (payload) => {
  store.dispatch(watcherActions.watcherStarted(payload))
})

rpc.on('watcher ready', (payload) => {
  store.dispatch(watcherActions.watcherReady(payload))
})

rpc.on('watcher set total files', (payload) => {
  store.dispatch(watcherActions.setTotalFiles(payload))
})

rpc.on('watcher set processed files', (payload) => {
  store.dispatch(watcherActions.setProcessedFiles(payload))
})

rpc.on('pipeline started', (payload) => {
  store.dispatch(watcherActions.pipelineStarted(payload))
})

rpc.on('pipeline complete', (payload) => {
  store.dispatch(watcherActions.pipelineComplete(payload))
})

rpc.on('pipeline log', (payload) => {
  store.dispatch(watcherActions.pipelineLog(payload))
})

rpc.on('pipeline error', (payload) => {
  store.dispatch(watcherActions.pipelineError(payload))
})

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
)
