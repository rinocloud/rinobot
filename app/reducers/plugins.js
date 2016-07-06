import { handleActions } from 'redux-actions';
import constants from '../constants'
import cloneDeep from 'lodash/cloneDeep'
import flatten from 'lodash/flatten'
import filter from 'lodash/filter'
import pick from 'lodash/pick'
import find from 'lodash/find'
import map from 'lodash/map'
import pt from 'path'


const defaultState = {
  searchResults: [],
  installedPackages: [
    { name: 'upload' },
    { name: 'copy' },
    { name: 'custom' },
  ],
  isSearching: false,
  statusText: null,
}

const createPluginItem = function (state, item) {
  let isInstalled = false
  let isLocal = false
  let copy = cloneDeep(item)

  let path = pt.join(constants.packagesDir, copy.name)
  if (find(state.installedPackages, { name: copy.name })) {
    isInstalled = true
  }

  if (copy.hasOwnProperty('isInstalled')) {
    isInstalled = copy.isInstalled
  }

  if (copy.hasOwnProperty('archive_url')) {
    copy = pick(copy, ['archive_url', 'name', 'id', 'full_name', 'html_url', 'description']);
  } else {
    path = copy.name
    isLocal = true
  }

  return {
    ...copy,
    isInstalled,
    isLocal,
    path,
    isInstalling: false,
  }
}

/* Reduce */
export default handleActions({

  PLUGINS_TOGGLE_IS_INSTALLING: (state, action) => ({
    ...state,
    searchResults: [
      ...state.searchResults.slice(0, action.payload),
      {
        ...state.searchResults[action.payload],
        isInstalling: !state.searchResults[action.payload].isInstalling
      },
      ...state.searchResults.slice(action.payload + 1)
    ]
  }),

  PLUGIN_TOGGLE_IS_INSTALLED: (state, action) => ({
    ...state,
    searchResults: [
      ...state.searchResults.slice(0, action.payload),
      {
        ...state.searchResults[action.payload],
        isInstalled: !state.searchResults.isInstalled
      },
      ...state.searchResults.slice(action.payload + 1)
    ]
  }),

  PLUGINS_TOGGLE_IS_SEARCHING: (state) => ({
    ...state,
    isSearching: !state.isSearching,
  }),

  PLUGINS_SET_SEARCH_RESULTS: (state, action) => ({
    ...state,
    searchResults: filter(
              map(action.payload.items, createPluginItem.bind(null, state)),
              o => o.name !== 'rinobot.js'),
    statusText: null
  }),

  PLUGINS_SET_ERROR: (state, action) => ({
    ...state,
    statusText: action.payload
  }),

  PLUGIN_SET_INSTALLED_PACKAGE: (state, action) => ({
    ...state,
    installedPackages: flatten([
      ...defaultState.installedPackages,
      filter(
        map(action.payload, createPluginItem.bind(null, state)),
        o => o.name !== 'rinobot.js')
    ]),
    statusText: null
  }),

  PLUGIN_ADD_INSTALLED_PACKAGE: (state, action) => ({
    ...state,
    installedPackages: flatten([
      ...state.installedPackages,
      filter(
        map(action.payload, createPluginItem.bind(null, state)),
        o => o.name !== 'rinobot.js'),
    ]),
    statusText: null
  }),

  PLUGIN_REMOVE_INSTALLED_PACKAGE: (state, action) => ({
    ...state,
    installedPackages: [
      ...state.installedPackages.slice(0, action.payload),
      ...state.installedPackages.slice(action.payload + 1)
    ],
    statusText: null
  }),

}, defaultState)
