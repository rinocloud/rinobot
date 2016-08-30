import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'
import watcher from './watcher'
import plugins from './plugins'
import auth from './auth'
import ui from './ui'

const rootReducer = combineReducers({
  watcher,
  auth,
  plugins,
  ui,
  routing
})

export default rootReducer
