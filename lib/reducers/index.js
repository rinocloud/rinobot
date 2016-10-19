import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'
import watcher from './watcher'
import plugins from './plugins'
import form from './form'
import auth from './auth'
import ui from './ui'

const rootReducer = combineReducers({
  plugins,
  watcher,
  form,
  auth,
  ui,

  // this one is not made by us - its made by react-router-redux
  routing
})

export default rootReducer
