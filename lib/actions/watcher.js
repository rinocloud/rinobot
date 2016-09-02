import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import rpc from '../rpc'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
import constants from '../constants'
import { createAction } from 'redux-actions'
import { getConfig } from './utils'

/*
  Watcher error message
*/

export const setError = createAction('WATCHER_SET_ERROR')

export const dismissError = createAction('WATCHER_DISMISS_ERROR')

/*
  History
*/

export const setHistory = createAction('WATCHER_SET_HISTORY')

export const unsetHistory = createAction('WATCHER_UNSET_HISTORY')

export const setHistoryError = createAction('WATCHER_SET_HISTORY_ERROR')

export const addHistoryStdout = createAction('WATCHER_ADD_HISTORY_STDOUT')

/*
  Task logging
*/

export const taskStarted = (opts) => () => {
  const { relativePath, command, args, match } = opts
  window.mixpanel.track('Task started', {
    filepath: relativePath,
    command,
    args,
    match
  })
}

export const taskComplete = (opts) => () => {
  const { relativePath, command, args, match } = opts
  window.mixpanel.track('Task completed', {
    filepath: relativePath,
    command,
    args,
    match
  })
}

export const taskIgnore = (opts) => (dispatch, ) => { // eslint-disable-line
  const { relativePath, command, args, match, reason } = opts
  window.mixpanel.track('Task ignored', {
    filepath: relativePath,
    command,
    args,
    match,
    reason
  })
}

export const taskLog = (opts) => (dispatch) => {
  const { index, filepath, log } = opts

  dispatch(addHistoryStdout({
    index,
    filepath,
    stdout: log
  }))
}

export const taskError = (opts) => (dispatch) => {
  const { index, filepath, relativePath, command, args, error, match } = opts

  window.mixpanel.track('Task error', {
    filepath: relativePath,
    command,
    args,
    match,
    error_name: error.name,
    error_message: error.message,
    error_code: error.code,
    error_syscall: error.syscall,
    error_path: error.path,
  })

  dispatch(setHistoryError({
    index,
    filepath,
    error
  }))
}


/*
  Starting and stopping a watched directory
*/

export const startDir = (index) => (dispatch, getState) => {
  const apiToken = getState().auth.token
  const config = getState().watcher.dirs[index].config
  const tasksDbPath = constants.tasksDbPath

  dispatch(createAction('WATCHER_START_DIR')(index))
  window.mixpanel.track('Start watching directory')
  const dir = getState().watcher.dirs[index]
  rpc.emit('watch', {
    tasksDbPath,
    apiToken,
    config,
    path: dir.path,
    pluginsDir: constants.packagesDir,
    index
  })
}

export const stopDir = (index) => (dispatch) => {
  dispatch(createAction('WATCHER_STOP_DIR')(index))
  dispatch(unsetHistory(index))
  rpc.emit('unwatch', { index })
}

/*
  Respond to RPC to set file counts
*/

export const setTotalFiles = ({ index, numFiles }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(createAction('SET_TOTAL_FILES')({ index, numFiles }))
}

export const setProcessedFiles = ({ index, numFiles }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(createAction('SET_PROCESSED_FILES')({ index, numFiles }))
}

/*
  Respond to RPC about watcher
*/

export const watcherStarted = ({ index }) => (dispatch, getState) => {}

export const watcherReady = ({ index, delta }) => (dispatch, getState) => {}

/*
  Watched directories
*/

export const addDir = (path) => (dispatch) => {
  const config = getConfig(path)
  window.mixpanel.track('Add directory')

  dispatch(createAction('WATCHER_ADD_DIR')({ path, config }))
  dispatch(persistDirs())
}

export const removeDir = (index) => (dispatch, getState) => {
  if (getState().watcher.dirs[index].isStarted) {
    rpc.emit('unwatch', getState().watcher.dirs[index].path)
  }
  dispatch(createAction('WATCHER_REMOVE_DIR')(index))
  dispatch(persistDirs())
}

export const setDirs = createAction('WATCHER_SET_DIRS')

export const persistDirs = () => (dispatch, getState) => {
  const data = _.map(getState().watcher.dirs, o => _.omit(o, 'config'))

  const str = JSON.stringify(data, null, 3)
  fs.writeFile(constants.watcherFilePath, str, 'utf-8', (err) => {
    if (err) dispatch(setError(err.message))
  })
}

export const readLocalDirs = () => (dispatch, getState) => {
  let pluginsJSON = null
  try {
    pluginsJSON = JSON.parse(fs.readFileSync(constants.watcherFilePath))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  if (pluginsJSON) {
    dispatch(setDirs(pluginsJSON))
    getState().watcher.dirs.map((dir, index) => dispatch(readLocalConfig(index)))
  }
}

/*
  Config
*/

export const toggleisConfigOpen = (index) => (dispatch, getState) => {
  if (!getState().watcher.dirs[index].isConfigOpen) {
    window.mixpanel.track('Open config')
  }
  return dispatch(createAction('WATCHER_TOGGLE_CONFIG_OPEN')(index))
}

export const readLocalConfig = (index) => (dispatch, getState) => {
  const config = getConfig(getState().watcher.dirs[index].path)
  dispatch(createAction('WATCHER_SET_CONFIG')({ index, config }))
}


export const setConfig = (index, config) => (dispatch) => {
  dispatch(createAction('WATCHER_SET_CONFIG')({ index, config }))
}

export const persistConfig = (index) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  let config = _.cloneDeep(dir.config)
  const metadata = {}
  _.each(config.metadata, o => {
    if (o.field && o.field !== '') {
      metadata[o.field] = o.value
    }
  })
  config.metadata = metadata
  if (_.isEmpty(config.metadata)) {
    config = _.omit(config, 'metadata')
  }
  config.apiToken = getState().auth.token
  config = _.omit(config, 'base', 'metadataExtensions', 'ignore', 'apiToken')
  window.mixpanel.track('Set config', {
    // Tasks: config.tasks,
    Commands: _.map(config.tasks, 'command'),
    Match: _.map(config.tasks, 'match'),
    Args: _.map(config.tasks, 'args'),
    Metadata: config.metadata,
  })
  const str = yaml.dump(config)
  fs.writeFile(pt.join(dir.path, 'rino.yaml'), str, 'utf-8', (err) => {
    if (err) dispatch(setError(err.message))
  })
}

/*
  Clear Rino dir
*/

export const removeDotRino = (index) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  rimraf(`${dir.path}/.rino/`, (err) => {
    if (err) throw err;
  })
}
