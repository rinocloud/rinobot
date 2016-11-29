import { handleActions } from 'redux-actions'
import update from 'react-addons-update'

const defaultState = {
  files: {},
  templates: {},
  shelfOpen: false,
}

export default handleActions({
  METADATA_RESET: (state) =>
    update(state, {
      files: { $set: {} },
      shelfOpen: { $set: false }
    }),

  METADATA_SET_FILE: (state, action) =>
    update(state, {
      files: {
        $merge: {
          [action.payload]: {}
        }
      }
    }),

  METADATA_SET_METADATA: (state, action) =>
    update(state, {
      files: {
        $merge: {
          [action.payload.path]: action.payload.metadata
        }
      }
    }),

  METADATA_OPEN_SHELF: (state) =>
    update(state, {
      shelfOpen: {
        $set: true
      }
    }),

  METADATA_CLOSE_SHELF: (state) =>
    update(state, {
      shelfOpen: {
        $set: false
      }
    }),

  METADATA_SET_TEMPLATES: (state, action) =>
    update(state, {
      templates: {
        $set: action.payload
      }
    }),

  METADATA_ADD_TEMPLATE: (state, action) =>
    update(state, {
      templates: {
        [action.payload.name]: {
          $set: action.payload.template
        }
      }
    }),

}, defaultState)
