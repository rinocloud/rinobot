import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'
import { reducer as reduxForm } from 'redux-form'
import pipelineForm from './pipelineForm'
import settings from './settings'
import pipelines from './pipelines'
import metadata from './metadata'
import notebook from './notebook'
import watcher from './watcher'
import plugins from './plugins'
import auth from './auth'
import ui from './ui'
import fs from './fs'

const rootReducer = combineReducers({
  form: reduxForm,
  pipelineForm,
  pipelines,
  settings,
  metadata,
  notebook,
  plugins,
  watcher,
  auth,
  ui,
  fs,
  routing
})

export default rootReducer
