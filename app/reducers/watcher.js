import { handleActions } from 'redux-actions';

import _ from 'underscore'

/* Default state */
const defaultState = {
  // this is the users Rinocloud api token
  token : null,
  error: null,
  paths: [],
  logs: [],
  dev_logs: [],
  showDevLogs: false,
  busy: false
}

/* Reduce */
export default handleActions({
  WATCHER_SET_TOKEN: (state, action) => ({
    ...state,
    token: action.payload ? (action.payload.length > 0 ? action.payload : null) : null,
    error: action.payload ? (action.payload.length == 0 ? "Token is too short" : null): null,
  }),

  WATCHER_ADD_PATHS: (state, action) => ({
    ...state,
    paths: _.flatten([...state.paths, action.payload])
  }),

  WATCHER_ADD_LOGS: (state, action) => ({
    ...state,
    logs: _.flatten([...state.logs, action.payload])
  }),

  WATCHER_ADD_DEV_LOGS: (state, action) => ({
    ...state,
    dev_logs: _.flatten([...state.dev_logs, action.payload])
  }),

  WATCHER_CLEAR_LOGS: (state, action) => ({
    ...state,
    logs: [],
    dev_logs: []
  }),

  WATCHER_START_BUSY: (state, action) => ({
    ...state,
    busy: true
  }),

  WATCHER_STOP_BUSY: (state, action) => ({
    ...state,
    busy: false
  }),

  WATCHER_TOGGLE_SHOW_DEV_LOGS: (state, action) => ({
    ...state,
    showDevLogs: !state.showDevLogs
  }),

  WATCHER_REMOVE_BY_INDEX: (state, action) => ({
    ...state,
    paths: [
      ...state.paths.slice(0, action.payload),
      ...state.paths.slice(action.payload + 1)
    ]
  })

}, defaultState)
