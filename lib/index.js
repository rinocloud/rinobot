import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import rpcMap from './rpcMap'
import routes from './routes'
import configureStore from './configureStore'
import * as actions from './actions/index'
import './css/rinobot.scss'

try {
  if (process.env.NODE_ENV !== 'production') {
    require('devtron').install() // eslint-disable-line
  }
  const store = configureStore()
  const history = syncHistoryWithStore(hashHistory, store)
  store.dispatch(actions.startup())
  window.store = store
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
