/*

Actions for the watcher.

The reducer is a list of directories so
most of the below actions work on the list.

*/


import _ from 'lodash'
import { createAction } from 'redux-actions'
import rpc from '../rpc'
import * as uiActions from './ui'
import constants from '../constants'
import mixpanel from 'mixpanel-browser'

import {
  getConfig,
  writeConfig,
  rmDotRino,
  writeDirs,
  readDirs
 } from './utils'


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
  mixpanel.track('Task started', {
    filepath: relativePath,
    command,
    args,
    match
  })
}


export const taskComplete = (opts) => () => {
  const { relativePath, command, args, match } = opts
  mixpanel.track('Task completed', {
    filepath: relativePath,
    command,
    args,
    match
  })
}


export const taskIgnore = (opts) => (dispatch, ) => { // eslint-disable-line
  const { relativePath, command, args, match, reason } = opts
  mixpanel.track('Task ignored', {
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

  mixpanel.track('Task error', {
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
  const config = getState().watcher[index].config
  const tasksDbPath = constants.tasksDbPath

  dispatch(createAction('WATCHER_START_DIR')(index))
  dispatch(uiActions.startStarting())
  mixpanel.track('Start watching directory')
  const dir = getState().watcher[index]
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


export const stopAll = () => () => {
  rpc.emit('unwatch all')
}

/*
  Respond to RPC to set file counts
*/


export const setTotalFiles = ({ index, numFiles }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(createAction('SET_TOTAL_FILES')({ index, numFiles }))
  dispatch(uiActions.stopStarting())
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
  mixpanel.track('Add directory')

  dispatch(createAction('WATCHER_ADD_DIR')({ path, config }))
  dispatch(persistDirs())
  dispatch(uiActions.setCurrentDir('latest'))
}


export const removeDir = (index) => (dispatch, getState) => {
  if (getState().watcher[index].isStarted) {
    rpc.emit('unwatch', getState().watcher[index].path)
  }
  dispatch(createAction('WATCHER_REMOVE_DIR')(index))
  dispatch(persistDirs())
  dispatch(uiActions.setCurrentDir(index - 1))
}


export const setDirs = createAction('WATCHER_SET_DIRS')


export const persistDirs = () => (dispatch, getState) => {
  writeDirs(getState().watcher, (err) => {
    if (err) alert(err)
  })
}


export const readLocalDirs = () => (dispatch, getState) => {
  readDirs((err, dirs) => {
    if (err) {
      alert(err)
    } else {
      dispatch(setDirs(dirs))
      getState().watcher.map((dir, index) => dispatch(readLocalConfig(index)))
    }
  })
}

/*
  Config
*/

export const readLocalConfig = (index) => (dispatch, getState) => {
  const config = getConfig(getState().watcher[index].path)
  dispatch(createAction('WATCHER_SET_CONFIG')({ index, config }))
}


export const setConfig = (index, config) => (dispatch) => {
  mixpanel.track('Set config', {
    'File Matches': _.chain(config.pipelines).map('filematch').value(),
    Tasks: _.chain(config.pipelines).flatMap('tasks').map('name').value(), // eslint-disable-line
    Args: _.chain(config.pipelines).flatMap('tasks').map('args').value(), // eslint-disable-line
    Metadata: config.metadata,
  })
  dispatch(createAction('WATCHER_SET_CONFIG')({ index, config }))
}

export const persistConfig = (index) => (dispatch, getState) => {
  const dir = getState().watcher[index]
  writeConfig(dir.path, dir.config, (err) => {
    if (err) alert(err)
  })
}

export const setConfigDirty = createAction('WATCHER_SET_DIRTY_CONFIG')

export const unsetConfigDirty = createAction('WATCHER_UNSET_DIRTY_CONFIG')


/*
  Clear Rino dir
*/

export const removeDotRino = (index) => (dispatch, getState) => {
  const dir = getState().watcher[index]
  rmDotRino(dir.path, err => {
    if (err) throw err;
  })
}
