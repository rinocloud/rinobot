import { handleActions } from 'redux-actions'
import { createConfig } from './reducer-utils'
import _ from 'lodash'
import update from 'react-addons-update'

const defaultState = {
  error: null,
  dirs: [],
}

const createDir = (dir) => ({
  ...dir,

  isStarted: false,
  isConfigOpen: false,
  isLogsOpen: true,
  isCustomPlugin: false,

  totalFiles: 0,
  processedFiles: 0,
  path: dir.path,
  config: createConfig(dir.config),
  history: {
    /*
      Example of history object coming from the watcher

      {
        "absolute/file/path.txt": {
          createdOn: "ISO-timestamp",
          lastSynchronization: null,
          lastRun: "ISO-timestamp",
          etag: "27ad70708eff618bbee631b2324c1ac5",
          completed: [
            "taskname,taskargs",
          ],
          id: null,
          current: null or name of current task
        }
      }

      We also merge the following objects into a history:

        {
          error: {
            name: "",
            message: "",
            stack: "",
            errno: "",
            code: "",
            syscall: "",
            path: ""
          }
        }

      And a stdout -> for example if python prints something

        {
          stdout: [
            "list of strings",
            "split by newline"
          ]
        }
    */
  }
})


export default handleActions({

  WATCHER_SET_ERROR: (state, action) =>
    update(state, {
      error: {
        $set: _.isString(action.payload) ? {
          name: 'Error',
          message: action.payload,
          stack: ''
        } : action.payload
      }
    }),

  WATCHER_DISMISS_ERROR: (state) =>
    update(state, {
      error: {
        $set: null
      }
    }),

  WATCHER_SET_DIRS: (state, action) =>
    update(state, {
      dirs: {
        $set: _.map(action.payload, createDir)
      }
    }),

  WATCHER_ADD_DIR: (state, action) =>
    update(state, {
      dirs: {
        $push: [createDir(action.payload)]
      }
    }),

  WATCHER_REMOVE_DIR: (state, action) =>
    update(state, {
      dirs: {
        $splice: [[action.payload, 1]]
      }
    }),

  WATCHER_START_DIR: (state, action) =>
    update(state, {
      dirs: {
        [action.payload]: {
          isStarted: { $set: true }
        }
      }
    }),

  WATCHER_STOP_DIR: (state, action) =>
    update(state, {
      dirs: {
        [action.payload]: {
          isStarted: { $set: false },
          totalFiles: { $set: 0 },
          processedFiles: { $set: 0 },
        }
      }
    }),

  WATCHER_SET_HISTORY: (state, action) =>
    update(state, {
      dirs: {
        [action.payload.index]: {
          history: {
            $apply: (prevHistory) => {
              /*  here we update each file in the history to
                  have fields 'error' and 'stdout'
              */
              return _.reduce(action.payload.history, (prev, value, key) => {
                /*  add error and stdout to each obj if it
                    doesnt already exist
                */
                return update(prev, {
                  [key]: {
                    $apply: (pre) => {
                      return {
                        ...value,
                        error: pre && pre.error || null,
                        stdout: pre && pre.stdout || [],
                      }
                    }
                  }
                })
              }, prevHistory)
            }
          }
        }
      }
    }),

  WATCHER_UNSET_HISTORY: (state, action) =>
    update(state, {
      dirs: {
        [action.payload]: {
          history: {
            $set: {}
          }
        }
      }
    }),

  WATCHER_SET_HISTORY_ERROR: (state, action) =>
    update(state, {
      dirs: {
        [action.payload.index]: {
          history: {
            [action.payload.filepath]: {
              error: {
                $set: action.payload.error
              }
            }
          }
        }
      }
    }),

  WATCHER_ADD_HISTORY_STDOUT: (state, action) =>
    update(state, {
      dirs: {
        [action.payload.index]: {
          history: {
            [action.payload.filepath]: {
              stdout: {
                $push: action.payload.stdout.split(`\n`)
              }
            }
          }
        }
      }
    }),

  WATCHER_SET_CONFIG: (state, action) =>
    update(state, {
      dirs: {
        [action.payload.index]: {
          config: { $set: createConfig(action.payload.config) }
        }
      }
    }),

  SET_TOTAL_FILES: (state, action) =>
    update(state, {
      dirs: {
        [action.payload.index]: {
          totalFiles: { $set: action.payload.numFiles }
        }
      }
    }),

  SET_PROCESSED_FILES: (state, action) =>
    update(state, {
      dirs: {
        [action.payload.index]: {
          processedFiles: { $set: action.payload.numFiles },
          totalFiles: {
            $apply: (x) => (action.payload.numFiles > x ? action.payload.numFiles : x)
          }
        }
      }
    }),

}, defaultState)
