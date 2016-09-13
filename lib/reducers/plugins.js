import { handleActions } from 'redux-actions';
import update from 'react-addons-update'

const defaultState = {
  // list of all the available plugins
  registry: [],

  // the current installed plugins
  config: null,

  // ui - is currently searching
  isSearching: false,

  // error or not
  statusText: null,
}

/* Reduce */
export default handleActions({

  PLUGINS_SET_CONFIG: (state, action) =>
    update(state, {
      config: { $set: action.payload },
      statusText: { $set: null }
    }),

  PLUGINS_SET_REGISTRY: (state, action) =>
    update(state, {
      registry: { $set: action.payload },
      statusText: { $set: null }
    }),

  PLUGINS_ADD_PLUGIN_DETAILS: (state, action) =>
    update(state, {
      registry: {
        [action.payload.index]: {
          $merge: {
            ...action.payload.details,
            isInstalling: false
          }
        }
      }
    }),

  PLUGINS_SET_ERROR: (state, action) =>
    update(state, {
      statusText: {
        $set: (action.payload instanceof Error) ? action.payload.message : action.payload
      }
    }),

  PLUGINS_TOGGLE_IS_SEARCHING: (state) =>
    update(state, {
      isSearching: {
        $apply: is => !is
      }
    }),

  PLUGINS_TOGGLE_IS_INSTALLING: (state, action) =>
    update(state, {
      registry: {
        [action.payload]: {
          isInstalling: { $set: false }
        }
      }
    }),

}, defaultState)
