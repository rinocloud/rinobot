import { handleActions } from 'redux-actions'
import update from 'react-addons-update'

const defaultState = {
  currentFilePath: null,
  contents: '',
  state: 'previewing'
}

export default handleActions({
  NOTEBOOK_SET_CURRENT_FILE: (state, action) =>
    update(state, {
      currentFilePath: {
        $set: action.payload
      }
    }),

  NOTEBOOK_SET_CONTENTS: (state, action) =>
    update(state, {
      contents: {
        $set: action.payload
      }
    }),

  NOTEBOOK_SET_PREVIEWING: (state) =>
    update(state, {
      state: {
        $set: 'previewing'
      }
    }),

  NOTEBOOK_SET_EDITING: (state) =>
    update(state, {
      state: {
        $set: 'editing'
      }
    }),

}, defaultState)
