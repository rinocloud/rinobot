
import _ from 'lodash'
import semver from 'semver'
import { handleActions } from 'redux-actions';
import update from 'react-addons-update'

const defaultState = {
  // list of all the available plugins
  registry: [],

  // the list of installed plugins
  installed: [],

  // ui - is currently searching
  isSearching: false,

  // error or not
  statusText: null,
}

/* Reduce */
export default handleActions({

  PLUGINS_SET_INSTALLED: (state, action) =>
    update(state, {
      installed: { $set: action.payload },
      statusText: { $set: null }
    }),

  PLUGINS_SET_REGISTRY: (state, action) =>
    update(state, {
      registry: {
        /*
          Each item in the registry is of the form:
          {
            name,
            version,
            description,
            author,
            modified,
          }
        */
        $apply: () => {
          return _.map(action.payload, p => {
            return {
              ...p,
              isInstalling: false
            }
          })
        }
      },
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
          isInstalling: { $apply: x => !x }
        }
      }
    }),

}, defaultState)
