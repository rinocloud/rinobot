import fs from 'fs'
import constants from '../constants'
import * as pluginsActions from './plugins'
import * as authActions from './auth'
import * as watcherActions from './watcher'
import * as uiActions from './ui'
import { setupServices } from './analytics'
import mixpanel from 'mixpanel-browser'

/*
  function that gets run everytime the application
  is started
*/


export const startup = () => (dispatch) => {
  setupServices()
  if (!fs.existsSync(constants.packagesPrefix)) {
    fs.mkdirSync(constants.packagesPrefix)
  }

  if (!fs.existsSync(constants.packagesDir)) {
    fs.mkdirSync(constants.packagesDir)
  }

  dispatch(authActions.readLocalAuth())
  dispatch(pluginsActions.initPackageJson())
  dispatch(pluginsActions.fetchRegistry())
  dispatch(watcherActions.readLocalDirs())

  mixpanel.track('Rinobot startup or refresh')
}
