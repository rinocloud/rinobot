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

export const addLogs = (action) => (dispatch) => {
  dispatch(createAction('WATCHER_ADD_LOGS')(action))
}

export const clearLogs = createAction('WATCHER_CLEAR_LOGS')

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
  dispatch(createAction('WATCHER_START_DIR')(index))
  window.mixpanel.track('Start watching directory')
  const dir = getState().watcher.dirs[index]
  rpc.emit('watch', { path: dir.path, packagesDir: constants.packagesDir, index })
}

export const stopDir = (index) => (dispatch) => {
  dispatch(createAction('WATCHER_STOP_DIR')(index))
  dispatch(clearLogs(index))
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
  dispatch(setBusy(index))
  dispatch(createAction('SET_TOTAL_FILES')({ index, numFiles }))
}

export const setProcessedFiles = ({ index, numFiles }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(unsetBusy(index))
  dispatch(createAction('SET_PROCESSED_FILES')({ index, numFiles }))
}

/*
  Respond to RPC about watcher
*/

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

/*
  Task logging
*/

export const taskStarted = ({ index, pipePath, command, args, match }) => (dispatch, getState) => { // eslint-disable-line
  const dir = getState().watcher.dirs[index]
  const taskData = {
    directory: pt.join(dir.path, pipePath),
    relPath: pipePath,
    command,
    args,
    match
  }
  window.mixpanel.track('Task started', taskData)
  dispatch(addLogs({ index, logs: [`${pipePath}::${command} started`] }))
  dispatch(setBusy(index))
}

export const taskComplete = ({ index, pipePath, command, args, match }) => (dispatch, getState) => { // eslint-disable-line
  const dir = getState().watcher.dirs[index]
  const taskData = {
    directory: pt.join(dir.path, pipePath),
    relPath: pipePath,
    command,
    args,
    match
  }
  window.mixpanel.track('Task complete', taskData)
  dispatch(addLogs({ index, logs: [`${pipePath}::${command} complete`] }))
  dispatch(unsetBusy(index))
}

export const taskIgnore = ({ index, pipePath, command, args, match, reason }) => (dispatch, getState) => { // eslint-disable-line
  const dir = getState().watcher.dirs[index]
  const taskData = {
    directory: pt.join(dir.path, pipePath),
    relPath: pipePath,
    command,
    args,
    match,
    reason
  }
  window.mixpanel.track('Task ignore', taskData)
  dispatch(addLogs({ index, logs: [`${pipePath}::${command} ignored: ${reason}`] }))
  dispatch(unsetBusy(index))
}

/*
  Pipeline logging
*/

export const pipelineStarted = ({ index, pipePath }) => (dispatch, getState) => { // eslint-disable-line
  dispatch(setBusy(index))
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
  let str = error
  if (_.isObject(error)) {
    str = JSON.stringify(error, null, 2)
  }
  dispatch(addLogs({ index, logs: [
    `${pipePath}: error: ${str}`,
  ] }))
  dispatch(unsetBusy(index))
}
