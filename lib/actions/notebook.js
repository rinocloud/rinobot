import { createAction } from 'redux-actions'
import Raven from 'raven-js'
import * as uiActions from './ui'
import pt from 'path'
import fs from 'fs'


export const setEditing = createAction('NOTEBOOK_SET_EDITING')


export const setPreviewing = createAction('NOTEBOOK_SET_PREVIEWING')


export const setFile = createAction('NOTEBOOK_SET_CURRENT_FILE')


export const setContents = createAction('NOTEBOOK_SET_CONTENTS')


export const newNotebook = (name, dirPath) => (dispatch) => {
  const npath = pt.join(dirPath, `${name}.md`)
  dispatch(setFile(npath))
  fs.writeFile(npath, '', (err) => {
    if (err) {
      dispatch(uiActions.addError(`Could not create notebook: ${npath}`))
      return Raven.captureException(err)
    }
  })
}


export const save = () => (dispatch, getState) => {
  const npath = getState().notebook.currentFilePath

  fs.writeFile(npath, getState().notebook.contents, (err) => {
    if (err) {
      dispatch(uiActions.addError(`Could not create notebook: ${npath}`))
      return Raven.captureException(err)
    }
  })
}


export const load = () => (dispatch, getState) => {
  fs.readFile(getState().notebook.currentFilePath, 'utf-8', (err, data) => {
    if (err) {
      dispatch(uiActions.addError('Could not read notebook.'))
      return Raven.captureException(err)
    }

    dispatch(setContents(data))
  })
}
