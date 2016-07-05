import { handleActions } from 'redux-actions';
import map from 'lodash/map'

const defaultState = {
  error: null,
  dirs: [],
  statusText: null
}

const defaultDirState = {
  isStarted: false,
  configOpen: false
}

const createDir = (dir) => ({
  path: dir.path,
  isStarted: false,
  configOpen: false,
  config: dir.config || null,
})

export default handleActions({

  WATCHER_SET_ERROR: (state, action) => ({
    ...state,
    statusText: action.payload
  }),

  WATCHER_SET_DIRS: (state, action) => ({
    ...state,
    dirs: map(action.payload, (o) => ({
      ...o,
      ...defaultDirState
    }))
  }),

  WATCHER_ADD_DIR: (state, action) => ({
    ...state,
    dirs: [...state.dirs, createDir(action.payload)]
  }),

  WATCHER_REMOVE_DIR: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

  WATCHER_START_DIR: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      {
        ...state.dirs[action.payload],
        isStarted: true
      },
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

  WATCHER_STOP_DIR: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      {
        ...state.dirs[action.payload],
        isStarted: false
      },
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

  WATCHER_TOGGLE_CONFIG_OPEN: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      {
        ...state.dirs[action.payload],
        configOpen: !state.dirs[action.payload].configOpen
      },
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

}, defaultState)
