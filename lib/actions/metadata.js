import { createAction } from 'redux-actions'
import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import async from 'async'
import yaml from 'js-yaml'
import Raven from 'raven-js'
import jsondiffpatch from 'jsondiffpatch'
import * as uiActions from './ui'
import db from './db'


export const reset = createAction('METADATA_RESET')


export const setFile = createAction('METADATA_SET_FILE')


export const setMetadata = createAction('METADATA_SET_METADATA')


export const openShelf = createAction('METADATA_OPEN_SHELF')


export const closeShelf = createAction('METADATA_CLOSE_SHELF')


export const setTemplates = createAction('METADATA_SET_TEMPLATES')


export const hydrateTemplates = () => (dispatch) => {
  db.metadataTemplates.find({}, (err, docs) => {
    const templates = _.reduce(docs, (col, item) => {
      col[item.name] = _.omit(item, ['name', '_id']) // eslint-disable-line
      return col
    }, {})

    if (docs) dispatch(setTemplates(templates))
  })
}


export const setFiles = () => (dispatch, getState) => {
  _.each(
      _.filter(getState().fs.items, { selected: true }),
      (item) => {
        dispatch(setFile(item.path))
      })
}


export const diffAndSave = (initialCommonMetadataObj, newCommonMetadataObj, diff) => (dispatch, getState) => {
  _.each(getState().metadata.files, (fileMetadata, path) => {
    const metadata = jsondiffpatch.patch(fileMetadata, diff)

    dispatch(setMetadata({
      path,
      metadata
    }))

    toFile(path, metadata, dispatch)
  })
}


export const loadMetadata = () => (dispatch, getState) => {
  async.map(_.keys(getState().metadata.files), (path, next) => {
    const extname = pt.extname(path)
    const mpath = path.replace(extname, '.yaml')
    fromFile(mpath, dispatch, (metadata) => {
      dispatch(setMetadata({
        path,
        metadata
      }))
      next()
    })
  })
}


const toFile = (fpath, metadata, dispatch) => {
  const extname = pt.extname(fpath)
  const mpath = fpath.replace(extname, '.yaml')

  const metadataStr = yaml.dump(metadata)

  fs.writeFile(mpath, metadataStr, (err) => {
    if (err) {
      dispatch(uiActions.addError(`Could not save metadata to ${mpath}`))
      return Raven.captureException(err)
    }
  })
}

const fromFile = (fpath, dispatch, callback) => {
  fs.readFile(fpath, (err, metadataStr) => {
    if (err && err.code !== 'ENOENT') {
      dispatch(uiActions.addError(`Could not load metadata for ${fpath}`))
      return Raven.captureException(err)
    }

    if (err) {
      return callback({})
    }

    const metadata = yaml.load(metadataStr)
    return callback(metadata)
  })
}


export const addTemplate = (name, template) => (dispatch) => {
  const payload = {
    name,
    ...template
  }

  dispatch(createAction('METADATA_ADD_TEMPLATE')({
    name,
    template
  }))

  db.metadataTemplates.update({ name },
    payload, {
      upsert: true
    }, (err) => {
      if (err) throw err
    })
}
