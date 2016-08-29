import _ from 'lodash'
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

const isDev = process.env.NODE_ENV === 'development'

window.mixpanel.init('ca24b54ea8a47247e80440d709622be3')
if (!isDev) {
  window.Raven.config(
    'https://140838b87a124da883424d7935b61743@app.getsentry.com/91879',
    {
      environment: process.env.NODE_ENV,
      release: window.rinobotVersion
    }
  ).install()

  window.mixpanel.register({
    environment: process.env.NODE_ENV,
    release: window.rinobotVersion
  })
} else {
  window.Raven = {
    captureException: (e) => console.error(e),
    setUserContext: _.noop,
    setExtraContext: _.noop
  }
  window.mixpanel.disable()
}

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

store.dispatch(actions.startup())

rpc.on('ready', () => {
  rpc.emit('init')
})

rpc.on('python version', args => store.dispatch(uiActions.pythonVersion(args)))

rpc.on('rinobot version', args => {
  store.dispatch(uiActions.rinobotVersion(args))
  if (window.Raven) window.Raven.setExtraContext(args)
})

rpc.on('update available', ({ releaseNotes, releaseName }) => {
  store.dispatch(uiActions.updateAvailable({
    version: releaseName,
    notes: releaseNotes
  }))
})

rpc.on('error', error => store.dispatch(uiActions.setError(error)))

rpc.on('log', args => console.log(`>>> ${args}`))

/*
  watcher related tasks
*/

rpc.on('unexpected error', error => store.dispatch(uiActions.setError(error)))

rpc.on('watcher started', args => store.dispatch(watcherActions.watcherStarted(args)))

rpc.on('watcher ready', args => store.dispatch(watcherActions.watcherReady(args)))

rpc.on('watcher set total files', args => store.dispatch(watcherActions.setTotalFiles(args)))

rpc.on('watcher set processed files', args => store.dispatch(watcherActions.setProcessedFiles(args))) // eslint-disable-line

rpc.on('task complete', args => store.dispatch(watcherActions.taskComplete(args)))

rpc.on('task started', args => store.dispatch(watcherActions.taskStarted(args)))

rpc.on('task ignore', args => store.dispatch(watcherActions.taskIgnore(args)))

rpc.on('task log', args => store.dispatch(watcherActions.taskLog(args)))

rpc.on('task error', args => store.dispatch(watcherActions.taskError(args)))

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
)
