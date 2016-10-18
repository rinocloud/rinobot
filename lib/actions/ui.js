import { createAction } from 'redux-actions'
import rpc from '../rpc';
import mixpanel from 'mixpanel-browser'

/*
  Python
*/


export const pythonVersion = createAction('UI_PYTHON_VERSION')


/*
  Current Rinobot version
*/


export const rinobotVersion = createAction('UI_RINOBOT_VERSION')


/*
  Start/stop watcher
*/


export const startStarting = createAction('UI_WATCHER_IS_STARTING')


export const stopStarting = createAction('UI_WATCHER_NOT_STARTING')


/*
  Updates
*/


export const updateAvailable = (payload) => (dispatch, getState) => {
  mixpanel.track('Update available', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: payload.version,
  })

  return dispatch(createAction('UI_UPDATE_AVAILABLE')(payload))
}


export const installUpdate = () => (dispatch, getState) => {
  mixpanel.track('Installing update', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: getState().ui.updateVersion,
  })

  rpc.emit('quit and install')
}


/*
  Current directory in view
*/


export const setCurrentDir = (payload) => (dispatch, getState) => {
  const dirsLength = getState().watcher.length

  if (payload === 'latest') {
    if (dirsLength > 0) {
      dispatch(createAction('UI_SET_CURRENT_DIR')(dirsLength - 1))
    } else {
      dispatch(createAction('UI_SET_CURRENT_DIR')(0))
    }
  } else if (payload > dirsLength) {
    dispatch(createAction('UI_SET_CURRENT_DIR')(dirsLength - 1))
  } else {
    dispatch(createAction('UI_SET_CURRENT_DIR')(payload))
  }
}
