import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import rpc from '../rpc'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
import moment from 'moment'
import constants from '../constants'
import { createAction } from 'redux-actions'
import { getConfig } from './utils'

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
  Watcher error message
*/

export const setError = createAction('WATCHER_SET_ERROR')

export const dismissError = createAction('WATCHER_DISMISS_ERROR')

/*
  Logs
*/

export const addLog = (action) => (dispatch) => {
  dispatch(createAction('WATCHER_ADD_LOG')(action))
}

export const clearLog = createAction('WATCHER_CLEAR_LOG')

export const toggleLogsOpen = createAction('WATCHER_TOGGLE_LOGS_OPEN')

/*
  Config
*/

export const toggleConfigOpen = (index) => (dispatch, getState) => {
  if (!getState().watcher.dirs[index].configOpen) {
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
  config = _.omit(config, 'base', 'metadataExtensions', 'ignore')
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
  dispatch(clearLog(index))
  rpc.emit('unwatch', { index })
}

/*
  Set busyness
*/

export const setBusy = createAction('WATCHER_SET_BUSY', {}, () => ({ throttle: { time: 100 } }))

export const unsetBusy = createAction('WATCHER_UNSET_BUSY', {}, () => ({ gather: { time: 1000 } }))

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

export const watcherStarted = ({ index }) => (dispatch, getState) => {
  const filepath = pt.basename(getState().watcher.dirs[index].path)

  dispatch(addLog({
    index,
    log: {
      filepath: `${filepath}/`,
      datetime: moment().toISOString(),
      status: 'started',
      message: 'Indexed directory',
    }
  }))
}

export const watcherReady = ({ index, delta }) => (dispatch, getState) => {
  const filepath = pt.basename(getState().watcher.dirs[index].path)

  dispatch(addLog({
    index,
    log: {
      filepath: `${filepath}/`,
      datetime: moment().toISOString(),
      status: 'complete',
      message: `Indexed in ${delta}ms`,
    }
  }))
}

/*
  Task logging
*/

export const taskStarted = (opts) => (dispatch) => {
  const { index, filepath, command, args, match, datetime } = opts

  window.mixpanel.track('Task started', {
    filepath,
    command,
    args,
    match
  })

  dispatch(addLog({
    index,
    log: {
      filepath,
      datetime,
      status: 'started',
      message: null
    }
  }))

  dispatch(setBusy(index))
}

export const taskComplete = (opts) => (dispatch) => {
  const { index, filepath, command, args, match, datetime } = opts

  window.mixpanel.track('Task completed', {
    filepath,
    command,
    args,
    match
  })

  dispatch(addLog({
    index,
    log: {
      filepath,
      datetime,
      status: 'complete',
      message: null
    }
  }))

  dispatch(unsetBusy(index))
}

export const taskIgnore = (opts) => (dispatch, ) => { // eslint-disable-line
  const { index, filepath, command, args, match, reason, datetime } = opts

  window.mixpanel.track('Task ignored', {
    filepath,
    command,
    args,
    match,
    reason
  })

  dispatch(addLog({
    index,
    log: {
      filepath,
      datetime,
      status: 'ignored',
      message: null,
    }
  }))

  // dispatch(setBusy(index))
}

export const taskLog = (opts) => (dispatch) => {
  const { index, filepath, log, datetime } = opts

  dispatch(addLog({
    index,
    log: {
      filepath,
      datetime,
      status: null,
      message: log,
    }
  }))

  // dispatch(setBusy(index))
}

export const taskError = (opts) => (dispatch) => {
  const { index, filepath, command, args, error, match, datetime } = opts

  window.mixpanel.track('Task error', {
    filepath,
    command,
    args,
    match,
    error_name: error.name,
    error_message: error.message,
    error_code: error.code,
    error_syscall: error.syscall,
    error_path: error.path,
  })

  dispatch(addLog({
    index,
    log: {
      filepath,
      datetime,
      status: 'error',
      message: error.message,
    }
  }))

  dispatch(unsetBusy(index))
}
