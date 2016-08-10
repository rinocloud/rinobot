import { handleActions } from 'redux-actions';

const defaultState = {
  updateVersion: null,
  updateNotes: null,
  updateShowing: false
}

export default handleActions({
  UPDATE_AVAILABLE: (state, action) => ({
    updateVersion: action.payload.version,
    updateNotes: action.payload.notes || '',
    updateShowing: true
  })
}, defaultState)
