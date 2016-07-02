
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


import "./app.global.css"

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

var remote = require('electron').remote

try{
  const authJSON = JSON.parse(fs.readFileSync(constants.authFilePath, 'utf-8'))
  store.dispatch(authActions.setAuth(authJSON))
}catch(err){
  if(err.code != 'ENOENT') throw err
}

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
)
