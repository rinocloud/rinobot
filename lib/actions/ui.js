import { createAction } from 'redux-actions'
import rpc from '../rpc';

export const setCurrentDir = createAction('UI_SET_CURRENT_DIR')

export const setError = createAction('UI_SET_ERROR')

export const pythonVersion = createAction('UI_PYTHON_VERSION')

export const rinobotVersion = createAction('UI_RINOBOT_VERSION')

export const updateAvailable = (payload) => (dispatch, getState) => {
  window.mixpanel.track('Update available', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: payload.version,
  })

  return dispatch(createAction('UI_UPDATE_AVAILABLE')(payload))
}

export const installUpdate = () => (dispatch, getState) => {
  window.mixpanel.track('Installing update', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: getState().ui.updateVersion,
  })

  rpc.emit('quit and install')
}
