import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
import { remote } from 'electron'
import constants from '../constants'
import { createAction } from 'redux-actions'
import { Pipeline } from '../rinobot.js/src/pipeline'

const chokidar = remote.getGlobal('mainProcessChokidar')
chokidar.close()

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
    ..._.omit(userOptions, 'tasks', 'ignore'),
    tasks: userOptions.tasks || []
  }
  return options
}

export const setError = createAction('WATCHER_SET_ERROR')
export const setDirs = createAction('WATCHER_SET_DIRS')
export const clearLogs = createAction('WATCHER_CLEAR_LOGS')
export const toggleConfigOpen = createAction('WATCHER_TOGGLE_CONFIG_OPEN')
export const setBusy = createAction('WATCHER_SET_BUSY')
export const unsetBusy = createAction('WATCHER_UNSET_BUSY')
export const toggleLogsOpen = createAction('WATCHER_TOGGLE_LOGS_OPEN')
export const _addDir = createAction('WATCHER_ADD_DIR')
export const _addLogs = createAction('WATCHER_ADD_LOGS')
export const _setConfig = createAction('WATCHER_SET_CONFIG')
export const _removeDir = createAction('WATCHER_REMOVE_DIR')
export const _startDir = createAction('WATCHER_START_DIR')
export const _stopDir = createAction('WATCHER_STOP_DIR')

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
    chokidar.closeByIndex(index)
  }
  dispatch(_removeDir(index))
  dispatch(persistDirs())
}

export const startDir = (index) => (dispatch, getState) => {
  dispatch(_startDir(index))
  const dir = getState().watcher.dirs[index]
  const log = (msg) => {
    dispatch(addLogs({ index, logs: [msg] }))
  }
  //
  // let i = 0;
  //
  // const timer = setInterval(() => {
  //   log(`${i} message`)
  //   dispatch(setBusy(index))
  //   i++
  //   if (i >= 10000) clearInterval(timer)
  // })
  //
  // return

  const paths = []

  const start = performance.now()
  log('Starting indexing')

  const w = chokidar.getChokidar()
    .watch(dir.path, {
      ignored: ['**.rino/**', '**/.rino'],
      ignoreInitial: false,
      usePolling: true
    })
    .on('add', (path) => {
      const p = new Pipeline({ // eslint-disable-line
        watchPath: dir.path,
        event: 'add',
        path,
        on_log: (pipeline, msg) => {
          setTimeout(() => {
            log(`${pipeline.relPath}: ${msg}`)
            dispatch(setBusy(index))
          })
        },
        on_complete: (pipeline) => {
          setTimeout(() => {
            if (!pipeline.ignored) {
              log(`${pipeline.relPath}: complete`)
            }
            dispatch(unsetBusy(index))
          })
        },
        on_error: (pipeline, error) => {
          setTimeout(() => {
            log(`${pipeline.relPath}: ${error.message}`)
            setTimeout(() => {
              dispatch(unsetBusy(index))
            }, 1000)
          })
        },
      })

      paths.push(path)
    })
    .on('ready', () => {
      const end = performance.now()
      const time = end - start;
      log(`Indexed ${Object.keys(w.getWatched()).length} directories in: ${time.toFixed(2)} ms`);
    })
  chokidar.addWatch(w)
}

export const stopDir = (index) => (dispatch) => {
  dispatch(_stopDir(index))
  dispatch(clearLogs(index))
  chokidar.closeByIndex(index)
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
