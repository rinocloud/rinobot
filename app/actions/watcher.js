import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import rpc from '../rpc'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
import constants from '../constants'
import { createAction } from 'redux-actions'
import { getConfig } from './utils'

export const setError = createAction('WATCHER_SET_ERROR')
export const setDirs = createAction('WATCHER_SET_DIRS')
export const clearLogs = createAction('WATCHER_CLEAR_LOGS')
export const toggleConfigOpen = createAction('WATCHER_TOGGLE_CONFIG_OPEN')
export const toggleLogsOpen = createAction('WATCHER_TOGGLE_LOGS_OPEN')
export const _addDir = createAction('WATCHER_ADD_DIR')
export const _setConfig = createAction('WATCHER_SET_CONFIG')
export const _removeDir = createAction('WATCHER_REMOVE_DIR')
export const _startDir = createAction('WATCHER_START_DIR')
export const _stopDir = createAction('WATCHER_STOP_DIR')
export const setBusy = createAction('WATCHER_SET_BUSY', {}, () => ({ throttle: { time: 100 } }))
export const unsetBusy = createAction('WATCHER_UNSET_BUSY', {}, () => ({ gather: { time: 1000 } }))
export const _setTotalFiles = createAction('SET_TOTAL_FILES')
export const _setProcessedFiles = createAction('SET_PROCESSED_FILES')
export const _addLogs = createAction('WATCHER_ADD_LOGS')

export const persistDirs = () => (dispatch, getState) => {
  const data = _.map(getState().watcher.dirs, o => _.omit(o, 'config'))

  const str = JSON.stringify(data, null, 3)
  fs.writeFile(constants.watcherFilePath, str, 'utf-8', (err) => {
    if (err) dispatch(setError(err.message))
  })
}


export const readLocalDirs = () => (dispatch) => {
  let pluginsJSON = null
  try {
    pluginsJSON = JSON.parse(fs.readFileSync(constants.watcherFilePath))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  if (pluginsJSON) dispatch(setDirs(pluginsJSON))
}


export const persistConfig = (index) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  let config = _.cloneDeep(dir.config)
  const metadata = {}
  _.each(config.metadata, o => {
    metadata[o.field] = o.value
  })
  config.metadata = metadata
  if (_.isEmpty(config.metadata)) {
    config = _.omit(config, 'metadata')
  }
  config.apiToken = getState().auth.token
  config = _.omit(config, 'base', 'metadataExtensions', 'ignore')
  const str = yaml.dump(config)
  fs.writeFile(pt.join(dir.path, 'rino.yaml'), str, 'utf-8', (err) => {
    if (err) dispatch(setError(err.message))
  })
}


export const readLocalConfig = (index) => (dispatch, getState) => {
  const config = getConfig(getState().watcher.dirs[index].path)
  dispatch(_setConfig({ index, config }))
}


export const setConfig = (index, config) => (dispatch) => {
  dispatch(_setConfig({ index, config }))
}


export const addDir = (path) => (dispatch, getState) => {
  const config = getConfig(path)
  dispatch(_addDir({ path, config }))
  dispatch(persistDirs())
  dispatch(persistConfig(getState().watcher.dirs.length - 1))
}


export const removeDir = (index) => (dispatch, getState) => {
  if (getState().watcher.dirs[index].isStarted) {
    rpc.emit('unwatch', getState().watcher.dirs[index].path)
  }
  dispatch(_removeDir(index))
  dispatch(persistDirs())
}


export const startDir = (index) => (dispatch, getState) => {
  dispatch(_startDir(index))
  const dir = getState().watcher.dirs[index]
  rpc.emit('watch', { path: dir.path, index })
}


export const stopDir = (index) => (dispatch) => {
  dispatch(_stopDir(index))
  dispatch(clearLogs(index))
  rpc.emit('unwatch', { index })
}


export const removeDotRino = (index) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  rimraf(`${dir.path}/.rino/`, (err) => {
    if (err) throw err;
  })
}


export const addLogs = (action) => (dispatch) => {
  dispatch(_addLogs(action))
}


export const watcherStarted = ({ index }) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  dispatch(setTotalFiles({ index, numFiles: 0 }))
  dispatch(addLogs({ index, logs: [`Indexing ${dir.path}`] }))
}


export const watcherReady = ({ index, delta }) => (dispatch, getState) => {
  const dir = getState().watcher.dirs[index]
  dispatch(addLogs({ index, logs: [
    `Finished indexing in ${delta} ms`,
    `Watching ${dir.path}`,
  ] }))
}


export const setTotalFiles = ({ index, numFiles }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(setBusy(index))
  dispatch(_setTotalFiles({ index, numFiles }))
}

export const setProcessedFiles = ({ index, numFiles }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(unsetBusy(index))
  dispatch(_setProcessedFiles({ index, numFiles }))
}


export const pipelineComplete = ({ index, pipePath }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(unsetBusy(index))
}


export const pipelineLog = ({ index, logs, pipePath }) => (dispatch, getState) => { // eslint-disable-line
  const dir = getState().watcher.dirs[index]
  if (!dir.isBusy) {
    dispatch(setBusy(index))
    dispatch(unsetBusy(index))
  }
  dispatch(addLogs({ index, logs }))
}


export const pipelineError = ({ index, error, pipePath }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(unsetBusy(index))
  dispatch(addLogs({ index, logs: [
    `${pipePath}: ${error.message}`,
  ] }))
}

export const pipelineStarted = ({ index }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(setBusy(index))
}
