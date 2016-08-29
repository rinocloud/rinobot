import { handleActions } from 'redux-actions'
import _ from 'lodash'
import isPlainObject from 'lodash/isPlainObject'
import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'
import map from 'lodash/map'

const defaultState = {
  error: null,
  dirs: [],
}

const createDir = (dir) => ({
  ...dir,
  path: dir.path,
  isStarted: false,
  // configOpen: dir.config === null,
  configOpen: false,
  logsOpen: true,
  isCustomPlugin: false,
  isBusy: false,
  totalFiles: 0,
  processedFiles: 0,
  logs: {},
  config: dir.config == null ? null : createConfig(dir.config)
})

const createConfig = (config) => {
  let metadata = [{ field: '', value: '' }]
  let copy = {}

  if (config) {
    copy = cloneDeep(config)
    if (isPlainObject(copy.metadata)) {
      // metadata is a plain object when we read it from the rino.yaml file
      // we map it to an array like metadata = [{field: 'x', value: 'y'}]
      // this is so that we can allow the user to edit the field, value pairs
      // its almost impossible to let the user edit it if its just an object
      metadata = map(copy.metadata, (value, field) => ({ field, value }))
      copy = omit(copy, 'metadata')
    }
  }

  const newConfig = {
    tasks: [{
      match: '*',
      command: 'upload'
    }],
    metadata,
    ...copy,
  }
  return newConfig
}

export default handleActions({

  WATCHER_SET_ERROR: (state, action) => ({
    ...state,
    error: _.isString(action.payload) ? {
      name: 'Error',
      message: action.payload,
      stack: ''
    } : action.payload
  }),

  WATCHER_DISMISS_ERROR: (state) => ({
    ...state,
    error: null
  }),

  WATCHER_SET_DIRS: (state, action) => ({
    ...state,
    dirs: map(action.payload, createDir)
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
        isStarted: false,
        totalFiles: 0,
        processedFiles: 0
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

  WATCHER_SET_CONFIG: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload.index),
      {
        ...state.dirs[action.payload.index],
        config: createConfig(action.payload.config)
      },
      ...state.dirs.slice(action.payload.index + 1)
    ],
  }),

  WATCHER_ADD_LOG: (state, action) => {
    /*
      when status of file is updated

      action.payload.log: {
        filepath,
        datetime,
        status,
        message
      }

      logs:
        {
        [filepath]: {
          filepath: ""
          datetime: ""
          status: ""
          messages: []
        }
      }
    */
    const oldLogs = _.cloneDeep(state.dirs[action.payload.index].logs)
    const newLog = _.cloneDeep(action.payload.log)

    if (_.has(oldLogs, newLog.filepath)) {
      if (newLog.status) {
        oldLogs[newLog.filepath].status = newLog.status
      }
      if (newLog.message) {
        oldLogs[newLog.filepath].messages.push(newLog.message.split('\n'))
      }
    } else {
      oldLogs[newLog.filepath] = {
        filepath: newLog.filepath,
        status: newLog.status,
        datetime: newLog.datetime,
        messages: newLog.message ? [newLog.message] : [],
      }
    }

    return {
      ...state,
      dirs: [
        ...state.dirs.slice(0, action.payload.index),
        {
          ...state.dirs[action.payload.index],
          logs: oldLogs,
        },
        ...state.dirs.slice(action.payload.index + 1)
      ]
    }
  },

  WATCHER_CLEAR_LOG: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      {
        ...state.dirs[action.payload],
        logs: {},
      },
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

  WATCHER_TOGGLE_LOGS_OPEN: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      {
        ...state.dirs[action.payload],
        logsOpen: !state.dirs[action.payload].logsOpen
      },
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

  WATCHER_SET_BUSY: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      {
        ...state.dirs[action.payload],
        isBusy: true
      },
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

  WATCHER_UNSET_BUSY: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload),
      {
        ...state.dirs[action.payload],
        isBusy: false
      },
      ...state.dirs.slice(action.payload + 1)
    ],
  }),

  SET_TOTAL_FILES: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload.index),
      {
        ...state.dirs[action.payload.index],
        totalFiles: action.payload.numFiles
      },
      ...state.dirs.slice(action.payload.index + 1)
    ],
  }),

  SET_PROCESSED_FILES: (state, action) => ({
    ...state,
    dirs: [
      ...state.dirs.slice(0, action.payload.index),
      {
        ...state.dirs[action.payload.index],
        processedFiles: action.payload.numFiles,
        totalFiles: (action.payload.numFiles > state.dirs[action.payload.index].totalFiles ?
          action.payload.numFiles : state.dirs[action.payload.index].totalFiles)
      },
      ...state.dirs.slice(action.payload.index + 1)
    ],
  }),

}, defaultState)
