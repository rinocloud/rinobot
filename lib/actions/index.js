import fs from 'fs'
import constants from '../constants'
import * as pipelinesActions from './pipelines'
import * as pluginsActions from './plugins'
import * as authActions from './auth'
import * as settingsActions from './settings'
import { setupAnalytics } from './analytics'
import mixpanel from 'mixpanel-browser'

/*
  function that gets run everytime the application
  is started
*/


export const startup = () => (dispatch) => {
  setupAnalytics()
  /*
    this is to support earlier versions of rinobot which
    had a different name for the plugins folder
  */
  if (!fs.existsSync(constants.pluginsPrefix)) {
    fs.mkdirSync(constants.pluginsPrefix)
  }

  if (!fs.existsSync(constants.pluginsDir)) {
    fs.mkdirSync(constants.pluginsDir)
  }

  dispatch(authActions.hydrate())
  dispatch(pluginsActions.initPackageJson())
  dispatch(pluginsActions.fetchRegistry())
  dispatch(settingsActions.hydrate())
  dispatch(pipelinesActions.hydrate())

  mixpanel.track('Rinobot startup or refresh')
}
