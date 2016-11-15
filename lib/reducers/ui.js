import { handleActions } from 'redux-actions';
import update from 'react-addons-update'

const defaultState = {
  updateVersion: null,
  updateNotes: null,
  updateShowing: false,
  rinobotVersion: null,
  pythonVersion: null,
  currentDir: 0,
  watcherIsStarting: false,
  notification: {
    level: 'warning',
    position: 'bl',
    autoDismiss: 0,
  }
}

export default handleActions({
  UI_ADD_NOTIFICATION: (state, action) =>
    update(state, {
      notification: {
        $merge: action.payload
      },
    }),

  UI_ADD_ERROR: (state, action) =>
    update(state, {
      notification: {
        $set: {
          message: action.payload,
          level: 'error',
          position: 'bl'
        },
      },
    }),

  UI_ADD_WARNING: (state, action) =>
    update(state, {
      notification: {
        $set: {
          message: action.payload,
          level: 'warning'
        },
      },
    }),

  UI_ADD_LOG: (state, action) =>
    update(state, {
      notification: {
        $set: {
          message: action.payload,
          level: 'success'
        },
      },
    }),

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
