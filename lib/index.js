import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Devtron from 'devtron'
import rpcMap from './actions/rpcMap'
import routes from './routes'
import configureStore from './store/configureStore'
import * as actions from './actions/index'
import './css/rinobot.scss'

try {
  Devtron.install()

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
