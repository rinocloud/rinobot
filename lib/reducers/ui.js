import { handleActions } from 'redux-actions';
import update from 'react-addons-update'

const defaultState = {
  updateVersion: null,
  updateNotes: null,
  updateShowing: false,
  rinobotVersion: null,
  pythonVersion: null,
  currentDir: 0,
  watcherIsStarting: false
}

export default handleActions({
  UI_UPDATE_AVAILABLE: (state, action) =>
    update(state, {
      updateVersion: { $set: action.payload.version },
      updateNotes: { $set: action.payload.notes || '' },
      updateShowing: { $set: true }
    }),

  UI_PYTHON_VERSION: (state, action) =>
    update(state, {
      pythonVersion: { $set: action.payload.version }
    }),

  UI_RINOBOT_VERSION: (state, action) =>
    update(state, {
      rinobotVersion: { $set: action.payload.version }
    }),

  UI_SET_CURRENT_DIR: (state, action) =>
    update(state, {
      currentDir: { $set: action.payload }
    }),

  UI_WATCHER_IS_STARTING: (state) =>
    update(state, {
      watcherIsStarting: { $set: true }
    }),

  UI_WATCHER_NOT_STARTING: (state) =>
    update(state, {
      watcherIsStarting: { $set: false }
    }),

}, defaultState)
