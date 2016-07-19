import fs from 'fs'
import constants from '../constants'
import * as pluginsActions from './plugins'
import * as authActions from './auth'
import * as watcherActions from './watcher'


export const startup = () => (dispatch) => {
  if (!fs.existsSync(constants.packagesDir)) {
    fs.mkdirSync(constants.packagesDir)
  }

  dispatch(authActions.readLocalAuth())
  dispatch(pluginsActions.readLocalPlugins())
  dispatch(watcherActions.readLocalDirs())
}
