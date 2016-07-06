import fs from 'fs'
import pt from 'path'
import yaml from 'js-yaml'
import omit from 'lodash/omit'
import constants from '../constants'
import { createAction } from 'redux-actions'

const defaultConfig = {
  uploadTo: '',
  base: 'https://rinocloud.com',
  metadataExtensions: ['.toml', '.json', '.yaml', '.yml'],
  ignore: ['*.json', '*.yaml', '*.toml', '*.rino', 'rino.yaml', 'rino.json', '.rino/*', '*~']
}

export const getConfig = (watchPath) => {
  /*
    Get the config file from the directory being watched
    returns null if the rino.yaml file doesnt exist
  */
  let userOptions = {}
  try {
    userOptions = yaml.safeLoad(fs.readFileSync(pt.join(watchPath, 'rino.yaml'), 'utf8'))
    userOptions.ignore = userOptions.ignore || []
  } catch (e) {
    return null
  }

  // if we get some userOptions then extend the defaultConfig
  const options = {
    ...defaultConfig,
    ignore: [
      ...defaultConfig.ignore,
      ...userOptions.ignore
    ],
    ...omit(userOptions, 'tasks', 'ignore'),
    tasks: userOptions.tasks || []
  }
  return options
}

export const setError = createAction('WATCHER_SET_ERROR')
export const _addDir = createAction('WATCHER_ADD_DIR')
export const setDirs = createAction('WATCHER_SET_DIRS')
export const _setConfig = createAction('WATCHER_SET_CONFIG')
export const _removeDir = createAction('WATCHER_REMOVE_DIR')
export const startDir = createAction('WATCHER_START_DIR')
export const stopDir = createAction('WATCHER_STOP_DIR')
export const toggleConfigOpen = createAction('WATCHER_TOGGLE_CONFIG_OPEN')

export const readLocalDirs = () => (dispatch) => {
  let pluginsJSON = null
  try {
    pluginsJSON = JSON.parse(fs.readFileSync(constants.watcherFilePath))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  if (pluginsJSON) dispatch(setDirs(pluginsJSON))
}

export const persistDirs = () => (dispatch, getState) => {
  const str = JSON.stringify(getState().watcher.dirs, null, 3)
  fs.writeFile(constants.watcherFilePath, str, 'utf-8', (err) => {
    if (err) dispatch(setError(err.message))
  })
}

export const addDir = (path) => (dispatch) => {
  const config = getConfig(path)
  dispatch(_addDir({ path, config }))
  dispatch(persistDirs())
}

export const removeDir = (path) => (dispatch) => {
  dispatch(_removeDir(path))
  dispatch(persistDirs())
}

export const setConfig = (index, config) => (dispatch) => {
  dispatch(_setConfig({index, config}))
}
