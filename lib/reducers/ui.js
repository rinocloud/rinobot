import { handleActions } from 'redux-actions';
import update from 'react-addons-update'

const defaultState = {
  updateVersion: null,
  updateNotes: null,
  updateShowing: false,
  rinobotVersion: null,
  pythonVersion: null,
  error: null,
  currentDir: 0
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

  UI_SET_ERROR: (state, action) =>
    update(state, {
      error: { $set: action.payload }
    }),

  UI_SET_CURRENT_DIR: (state, action) =>
    update(state, {
      currentDir: { $set: action.payload }
    }),

}, defaultState)
