
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import routes from './routes'
import configureStore from './store/configureStore'
import fs from 'fs'
import constants from './constants'
import * as authActions from './actions/auth.js'
import * as pluginsActions from './actions/plugins.js'
import * as watcherActions from './actions/watcher.js'
import './app.global.css'

import rpc from './rpc'

rpc.on('ready', () => {
  rpc.emit('init')
})

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

if (!fs.existsSync(constants.packagesDir)) {
  fs.mkdirSync(constants.packagesDir)
}

store.dispatch(authActions.readLocalAuth())
store.dispatch(pluginsActions.readLocalPlugins())
store.dispatch(watcherActions.readLocalDirs())

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
)
