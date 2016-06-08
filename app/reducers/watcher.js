import { handleActions } from 'redux-actions';

import _ from 'underscore'

/* Default state */
const defaultState = {
  // this is the users Rinocloud api token
  token : null,
  error: null,
  paths: [],
  logs: [],
  busy: false,
  /*
    Rules allow users to create custom pipeline and upload logic

    example where we parse the file and upload the result:
      {
        match: "*.sp",
        process: "python parse.py {filepath} {extraMetadata}",
        upload: true, //defaults to true
        variables:[{
          extraMetadata: "some value"
        }]
      }

    example where we dont upload to rinocloud but copy to another location
      {
        match: "*.txt",
        process: "cp {filepath} {otherLocation}",
        upload: false,
        variables:[{
          otherLocation: "C:\\somewhere\else\"
        }]
      }
  */
  rules: []
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

  WATCHER_START_BUSY: (state, action) => ({
    ...state,
    busy: true
  }),

  WATCHER_STOP_BUSY: (state, action) => ({
    ...state,
    busy: false
  }),


}, defaultState)
