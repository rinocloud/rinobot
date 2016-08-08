import { handleActions } from 'redux-actions';

const defaultState = {
  updateVersion: null,
  updateNotes: null,
  updateShowing: false
}

export default handleActions({
  UPDATE_AVAILABLE: (state, action) => ({
    updateVersion: action.version,
    updateNotes: action.notes || '',
    updateShowing: true
  })
}, defaultState)
