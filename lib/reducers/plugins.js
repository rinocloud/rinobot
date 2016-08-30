import { handleActions } from 'redux-actions';

const defaultState = {
  pluginRegistry: [],
  config: null,
  isSearching: false,
  statusText: null,
}

/* Reduce */
export default handleActions({

  PLUGINS_SET_CONFIG: (state, action) => ({
    ...state,
    config: action.payload,
    statusText: null
  }),

  PLUGINS_SET_REGISTRY: (state, action) => ({
    ...state,
    pluginRegistry: action.payload,
    statusText: null
  }),

  PLUGINS_ADD_PLUGIN_DETAILS: (state, action) => ({
    ...state,
    pluginRegistry: [
      ...state.pluginRegistry.slice(0, action.payload.index),
      {
        ...state.pluginRegistry[action.payload.index],
        ...action.payload.details,
        isInstalling: false,
      },
      ...state.pluginRegistry.slice(action.payload.index + 1)
    ]
  }),

  PLUGINS_SET_ERROR: (state, action) => ({
    ...state,
    statusText: (action.payload instanceof Error) ? action.payload.message : action.payload
  }),

  PLUGINS_TOGGLE_IS_INSTALLING: (state, action) => ({
    ...state,
    pluginRegistry: [
      ...state.pluginRegistry.slice(0, action.payload),
      {
        ...state.pluginRegistry[action.payload],
        isInstalling: !state.pluginRegistry[action.payload].isInstalling
      },
      ...state.pluginRegistry.slice(action.payload + 1)
    ]
  }),

  PLUGINS_TOGGLE_IS_SEARCHING: (state) => ({
    ...state,
    isSearching: !state.isSearching,
  }),
}, defaultState)
