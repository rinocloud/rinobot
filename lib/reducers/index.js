import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'
import { reducer as reduxForm } from 'redux-form'
import settings from './settings'
import watcher from './watcher'
import plugins from './plugins'
import pipelineForm from './pipelineForm'
import auth from './auth'
import ui from './ui'
import fs from './fs'

const rootReducer = combineReducers({
  form: reduxForm,
  settings,
  plugins,
  watcher,
  pipelineForm,
  auth,
  ui,
  fs,

  // this one is not made by us - its made by react-router-redux
  routing
})

export default rootReducer
