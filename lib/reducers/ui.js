import { handleActions } from 'redux-actions';

const defaultState = {
  updateVersion: null,
  updateNotes: null,
  updateShowing: false,
  rinobotVersion: null,
  pythonVersion: null,
  error: null,
}

export default handleActions({
  UI_UPDATE_AVAILABLE: (state, action) => ({
    ...state,
    updateVersion: action.payload.version,
    updateNotes: action.payload.notes || '',
    updateShowing: true
  }),

  UI_PYTHON_VERSION: (state, action) => ({
    ...state,
    pythonVersion: action.payload.version
  }),

  UI_RINOBOT_VERSION: (state, action) => ({
    ...state,
    rinobotVersion: action.payload.version
  }),

  UI_SET_ERROR: (state, action) => ({
    ...state,
    error: action.payload
  })

}, defaultState)
