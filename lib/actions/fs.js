import { createAction } from 'redux-actions'
import { shell } from 'electron'
import Raven from 'raven-js'
import async from 'async'
import trash from 'trash'
import _ from 'lodash'
import pt from 'path'
import fs from 'fs'
import { saveableConfig, snippetTemplate } from './utils'
import * as pipelineFormActions from './pipelineForm'
import constants from '../constants'
import * as uiActions from './ui'
import rpc from '../rpc'
import db from './db'


export const setItems = createAction('FS_SET_ITEMS')


export const setSortedBy = (sortType) => (dispatch) => {
  dispatch(createAction('FS_SET_SORTED_BY')(sortType))
  dispatch(refreshDir())
}


export const setItemStarted = createAction('FS_SET_ITEM_STARTED')


export const setItemComplete = createAction('FS_SET_ITEM_COMPLETE')


export const setItemError = createAction('FS_SET_ITEM_ERROR')


export const setItemLog = createAction('FS_SET_ITEM_LOG')


export const itemSingleSelect = createAction('FS_ITEM_SINGLE_SELECT')


export const itemCtrlSelect = createAction('FS_ITEM_CTRL_SELECT')


export const itemShiftSelect = createAction('FS_ITEM_SHIFT_SELECT')


export const itemDragSelect = createAction('FS_ITEM_DRAG_SELECT')


export const unSelectAll = createAction('FS_UNSELECT_ALL')


export const hydrate = () => (dispatch, getState) => {
  /*
    This gets run when the application starts and it loads
    the saved path from the database into the redux store
  */

  const token = getState().auth.token
  if (token) {
    db.fs.findOne({ token: getState().auth.token }, (err, doc) => {
      if (doc) dispatch(setBasePath(doc.path))
    })
  }
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


export const processSelected = () => (dispatch, getState) => {
  const files = _.map(
                  _.filter(
                    getState().fs.items,
                    { selected: true, type: 'file' }
                  ),
                'path')

  const pipelineForm = _.cloneDeep(getState().pipelineForm)

  _.map(files, (path, index) => {
    pipelineForm.pipelines[0].filematch = `*${pt.extname(path)}`
    const opts = {
      index,
      filepath: path,
      baseDir: pt.dirname(path),
      pluginsDir: constants.pluginsDir,
      apiToken: getState().auth.token,
      matlabRoot: getState().settings.matlabRoot,
      pythonRoot: getState().settings.pythonRoot,
      rRoot: getState().settings.rRoot,
      config: saveableConfig(pipelineForm),
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

  trash(files).then(() => {
    dispatch(refreshDir())
  })
}


export const newSnippet = (name) => (dispatch, getState) => {
  const currentPath = getState().fs.currentPath
  const fname = pt.join(currentPath, `${name}.py`)

  fs.writeFile(fname, snippetTemplate(name), (err) => {
    if (err) throw err;
    dispatch(refreshDir())

    dispatch(pipelineFormActions.setForm({
      pipelines: [{
        filematch: null,
        incoming_only: true,
        tasks: [{
          name: 'python',
          args: { default: fname },
          keep: true,
          flow: 'then'
        }]
      }],
      metadata: [],
      isSaved: true
    }))

    shell.openItem(fname)
  })
}
