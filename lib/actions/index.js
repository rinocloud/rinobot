import fs from 'fs'
import constants from '../constants'
import * as pluginsActions from './plugins'
import * as authActions from './auth'
import * as watcherActions from './watcher'


export const startup = () => (dispatch) => {
  if (fs.existsSync(constants.oldPackagesDir) && !fs.existsSync(constants.packagesDir)) {
    console.log('renaming rinobot-packages to rinobot-plugins')
    fs.renameSync(constants.oldPackagesDir, constants.packagesDir)
  }

  if (!fs.existsSync(constants.packagesPrefix)) {
    fs.mkdirSync(constants.packagesPrefix)
  }

  if (!fs.existsSync(constants.packagesDir)) {
    fs.mkdirSync(constants.packagesDir)
  }

  dispatch(authActions.readLocalAuth())
  dispatch(pluginsActions.initPackageJson())
  dispatch(watcherActions.readLocalDirs())

  window.mixpanel.track('Rinobot startup or refresh')
}
