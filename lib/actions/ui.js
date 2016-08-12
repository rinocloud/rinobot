import { createAction } from 'redux-actions'
import rpc from '../rpc';

export const pythonVersion = createAction('PYTHON_VERSION')
export const rinobotVersion = createAction('RINOBOT_VERSION')

export const updateAvailable = (payload) => (dispatch, getState) => {
  window.mixpanel.track('Update available', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: payload.version,
  })

  return dispatch(createAction('UPDATE_AVAILABLE')(payload))
}

export const installUpdate = () => (dispatch, getState) => {
  window.mixpanel.track('Installing update', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: getState().ui.updateVersion,
  })

  rpc.emit('quit and install')
}
