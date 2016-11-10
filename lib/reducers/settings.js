import { handleActions } from 'redux-actions';
import update from 'react-addons-update'

const defaultState = {
  matlabRoot: null,
  pythonRoot: null,
  rRoot: null,
}

export default handleActions({
  SETTINGS_SET: (state, action) =>
    update(state, {
      $merge: action.payload
    }),

  SETTINGS_SET_MATLAB_ROOT: (state, action) =>
    update(state, {
      matlabRoot: {
        $set: action.payload
      }
    }),

  SETTINGS_SET_PYTHON_ROOT: (state, action) =>
    update(state, {
      pythonRoot: {
        $set: action.payload
      }
    }),

  SETTINGS_SET_R_ROOT: (state, action) =>
    update(state, {
      rRoot: {
        $set: action.payload
      }
    })

}, defaultState)
