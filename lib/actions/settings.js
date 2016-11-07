import { createAction } from 'redux-actions'
import db from './db'

export const setMatlabRoot = createAction('SETTINGS_SET_MATLAB_ROOT')


export const setPythonRoot = createAction('SETTINGS_SET_PYTHON_ROOT')


export const setRRoot = createAction('SETTINGS_SET_R_ROOT')


export const hydrate = () => (dispatch) => {
  db.settings.findOne({ key: 'settings' }, (err, doc) => {
    if (doc) {
      dispatch(setSettings({
        matlabRoot: doc.matlabRoot,
        pythonRoot: doc.pythonRoot,
        rRoot: doc.rRoot,
      }))
    }
  })
}


export const setSettings = (payload) => (dispatch, getState) => {
  console.log('setSettings', payload)
  dispatch(createAction('SETTINGS_SET')(payload))

  db.settings.update({ key: 'settings' },
    {
      key: 'settings',
      ...getState().settings
    },
    {
      upsert: true
    }, (err) => {
      if (err) throw err
    })
}
