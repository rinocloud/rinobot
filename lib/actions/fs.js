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
import db from './db'


export const hydrate = () => (dispatch, getState) => {
  /*
    This gets run when the application starts and it loads
    the saved path from the database into the redux store
  */
  db.fs.findOne({ token: getState().auth.token }, (err, doc) => {
    if (doc) dispatch(setBasePath(doc.path))
  })
}


export const setBasePath = (dirPath) => (dispatch, getState) => {
  /*
    basePath is the directory that the user selects to watch
  */
  dispatch(createAction('FS_SET_BASE_PATH')(dirPath))
  dispatch(readDir(dirPath))

  db.fs.update({ token: getState().auth.token },
    {
      token: getState().auth.token,
      path: dirPath
    }, {
      upsert: true
    }, (err) => {
      if (err) throw err
    })
}


export const setCurrentPath = (dirPath) => (dispatch) => {
  dispatch(createAction('FS_SET_CURRENT_PATH')(dirPath))
  dispatch(readDir(dirPath))
}


export const refreshDir = () => (dispatch, getState) => {
  dispatch(readDir(getState().fs.currentPath))
}


export const readDir = (dirPath) => (dispatch) => {
  fs.readdir(dirPath, (err, items) => {
    if (err) {
      dispatch(uiActions.addError(`Could not read dir ${dirPath}`))
      Raven.captureException(err)
    } else {
      async.map(
        _.map(items, fname => pt.join(dirPath, fname)),
        fs.stat,
        (er, stats) => {
          const dir = _.reduce(items, (collector, fname, index) => {
            if (fname[0] === '.') return collector
            collector[pt.join(dirPath, fname)] = { // eslint-disable-line
              name: fname,
              path: pt.join(dirPath, fname),
              type: stats[index].isFile() ? 'file' : 'folder',
            }
            return collector
          }, {})
          dispatch(setItems(dir))
        })
    }
  })
}


export const setItems = createAction('FS_SET_ITEMS')


export const toggleItemSelected = createAction('FS_TOGGLE_ITEM_SELECTED')


export const processSelected = () => (dispatch, getState) => {
  const files = _.map(
                  _.filter(
                    getState().fs.items,
                    { selected: true, type: 'file' }
                  ),
                'path')

  const form = _.cloneDeep(getState().form)

  _.map(files, (path, index) => {
    form.pipelines[0].filematch = `*${pt.extname(path)}`
    const opts = {
      index,
      filepath: path,
      baseDir: pt.dirname(path),
      pluginsDir: constants.pluginsDir,
      apiToken: getState().auth.token,
      config: saveableConfig(form),
      forceRerun: true
    }
    rpc.emit('process file', opts)
  })
}


export const rmSelected = () => (dispatch, getState) => {
  const files = _.map(
                  _.filter(
                    getState().fs.items,
                    { selected: true, type: 'file' }
                  ),
                'path')

  _.each(files, (file) => {
    fs.unlink(file, (err) => {
      if (err) throw err
      dispatch(refreshDir())
    })
  })
}
