import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import rpcMap from './rpcMap'
import routes from './routes'
import configureStore from './store/configureStore'
import * as actions from './actions/index'

import './css/font-awesome.css'
import './css/toolkit-startup.css'
import './css/application-startup.css'
import './css/rinocloud-icons.css'
import './css/react-select-plus.css'
import './css/rinobot.scss'

try {
  const store = configureStore()
  const history = syncHistoryWithStore(hashHistory, store)
  store.dispatch(actions.startup())

  rpcMap(store.dispatch)

  render(
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('root')
  )
} catch (e) {
  alert(e)
}
