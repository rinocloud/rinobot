import { handleActions } from 'redux-actions';
import filter from 'lodash/filter'
import map from 'lodash/map'
import find from 'lodash/find'

const defaultState = {
  results: [],
  totalCount: 0,
  statusText: null,
  isSearching: false,
}

const createPluginItem = function(state, item, i){
  let isInstalled = false
  if (find(state.results, {'name': item.name})) {
    isInstalled = true
  }

  if (item.hasOwnProperty('isInstalled')){
    isInstalled = item.isInstalled
  }

  return {
    ...item,
    isInstalled,
    isInstalling: false,
  }
}

/* Reduce */
export default handleActions({

  PLUGINS_TOGGLE_IS_INSTALLING: (state, action) => ({
    ...state,
    results: [
      ...state.results.slice(0, action.payload),
      {
        ...state.results[action.payload],
        isInstalling: !state.results[action.payload].isInstalling
      },
      ...state.results.slice(action.payload + 1)
    ]
  }),

  PLUGIN_INSTALLED_PACKAGE: (state, action) => ({
    ...state,
    results: [
      ...state.results.slice(0, action.payload),
      {
        ...state.results[action.payload],
        isInstalled: true
      },
      ...state.results.slice(action.payload + 1)
    ]
  }),

  PLUGIN_UNINSTALLED_PACKAGE: (state, action) => ({
    ...state,
    results: [
      ...state.results.slice(0, action.payload),
      {
        ...state.results[action.payload],
        isInstalled: false
      },
      ...state.results.slice(action.payload + 1)
    ]
  }),

  PLUGIN_REMOVE_PACKAGE: (state, action) => ({
    ...state,
    results: [
      ...state.results.slice(0, action.payload),
      ...state.results.slice(action.payload + 1)
    ]
  }),


  PLUGINS_TOGGLE_IS_SEARCHING: (state, action) => ({
    ...state,
    isSearching: !state.isSearching,
  }),

  PLUGINS_SET_RESULTS: (state, action) => ({
    ...state,
    results: filter(map(action.payload.items, createPluginItem.bind(null, state)), (o)=>{return o.name != "rinobot.js"}),
    totalCount: action.payload.total_count,
    statusText: null
  }),

  PLUGINS_SET_ERROR: (state, action) => ({
    ...state,
    statusText: action.payload
  })

}, defaultState)
