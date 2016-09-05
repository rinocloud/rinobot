import rpc from '../rpc'
import constants from '../constants'
import { createAction } from 'redux-actions'
import {
  getConfig,
  writeConfig,
  rmDotRino,
  writeDirs,
  readDirs
 } from './utils'

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
  writeDirs(getState().watcher.dirs, err => {
    if (err) dispatch(setError(err))
  })
}


export const readLocalDirs = () => (dispatch, getState) => {
  readDirs((err, dirs) => {
    if (err) {
      dispatch(setError(err))
    } else {
      dispatch(setDirs(dirs))
      getState().watcher.dirs.map((dir, index) => dispatch(readLocalConfig(index)))
    }
  })
}

/*
  Config
*/

export const readLocalConfig = (index) => (dispatch, getState) => {
  const config = getConfig(getState().watcher.dirs[index].path)
  dispatch(createAction('WATCHER_SET_CONFIG')({ index, config }))
}


export const setConfig = (index, config) => (dispatch) => {
  dispatch(createAction('WATCHER_SET_CONFIG')({ index, config }))
}

export const persistConfig = (index) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  writeConfig(dir.path, dir.config, (err) => {
    if (err) dispatch(setError(err))
  })
}

/*
  Clear Rino dir
*/

export const removeDotRino = (index) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  rmDotRino(dir.path, err => {
    if (err) throw err;
  })
}
