import { createAction } from 'redux-actions'
import * as uiActions from './ui'
import constants from '../constants'
import { saveableConfig } from './utils'
import Raven from 'raven-js'
import fs from 'fs'
import _ from 'lodash'
import async from 'async'
import pt from 'path'
import rpc from '../rpc'


export const setPath = (dirPath) => (dispatch) => {
  dispatch(createAction('FS_SET_PATH')(dirPath))
  dispatch(setItems(dirPath))
}

export const setItems = (dirPath) => (dispatch) => {
  fs.readdir(dirPath, (err, items) => {
    if (err) {
      dispatch(uiActions.addNotification({
        message: `Could not read dir ${dirPath}`,
        level: 'error'
      }))
      Raven.captureException(err)
    } else {
      async.map(
        _.map(items, fname => pt.join(dirPath, fname)),
        fs.stat,
        (er, stats) => {
          const dir = _.reduce(items, (collector, fname, index) => {
            if (fname[0] === '.') return collector

            collector[fname] = { // eslint-disable-line
              name: fname,
              path: pt.join(dirPath, fname),
              type: stats[index].isFile() ? 'file' : 'folder',
            }
            return collector
          }, {})
          dispatch(createAction('FS_SET_ITEMS')(dir))
        })
    }
  })
}

export const toggleItemSelected = createAction('FS_TOGGLE_ITEM_SELECTED')

export const processFiles = (paths) => (dispatch, getState) => {
  const form = _.cloneDeep(getState().form)

  _.map(paths, (path, index) => {
    form.pipelines[0].filematch = `*${pt.extname(path)}`
    const opts = {
      index,
      filepath: path,
      baseDir: pt.dirname(path),
      pluginsDir: constants.packagesDir,
      apiToken: getState().auth.token,
      config: saveableConfig(form)
    }

    console.log(opts)

    rpc.emit('process file', opts)
  })
}
