import { handleActions } from 'redux-actions'
import _ from 'lodash'
import update from 'react-addons-update'
const defaultState = []

export const mapMetadataToList = (obj) =>
  _.map(obj, (value, field) => ({ field, value }))

export const mapArgStringToObject = (str) => {
  const obj = {}

  if (str.split(' ').length === 1) {
    return { default: str }
  }

  if (str.split('--').length === 1) {
    return { default: str }
  }

  _.each(str.split(' '), s => {
    const arr = s
      .replace('--', '')
      .split('=')

    if (arr[0] !== '' && !_.isUndefined(arr[1])) {
      obj[arr[0]] = arr[1]
    }
  })

  return obj
}

export const mapTaskArgsToObject = (tasks = []) =>
  _.map(tasks, task => {
    const _task = _.clone(task)
    if (task.args && _.isString(task.args)) {
      _task.args = mapArgStringToObject(task.args)
    }
    return _task
  })

export const createConfig = (config) =>
  update(config || {}, {
    metadata: {
      $apply: (oldMetadata = {}) => {
        if (_.isPlainObject(oldMetadata)) {
          return mapMetadataToList(oldMetadata)
        }
        return oldMetadata
      }
    },
    pipelines: {
      $apply: (pipelines = []) =>
        _.map(pipelines, pipeline => {
          return update(pipeline, {
            tasks: { $apply: mapTaskArgsToObject }
          })
        })
    }
  })


const createDir = (dir) => ({
  ...dir,

  // is the watcher started
  isStarted: false,

  // is the current configuration saved

  isSaved: false,
    // total number of files being watched
  totalFiles: 0,

  // number of files which have been processed so far
  processedFiles: 0,

  // path to this directory
  path: dir.path,

  // the configuration from the rino.yaml file
  config: createConfig(dir.config),

  history: {
    /*
      Example of history object coming from the watcher

      {
        "absolute/file/path.txt": {
          created_on: "ISO-timestamp",
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

      And a stdout: [], for example if python prints something

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
  WATCHER_SET_DIRS: (state, action) =>
    update(state, {
      $set: _.map(action.payload, createDir)
    }),

  WATCHER_ADD_DIR: (state, action) =>
    update(state, {
      $push: [createDir(action.payload)]
    }),

  WATCHER_REMOVE_DIR: (state, action) =>
    update(state, {
      $splice: [[action.payload, 1]]
    }),

  WATCHER_START_DIR: (state, action) =>
    update(state, {
      [action.payload]: {
        isStarted: { $set: true }
      }
    }),

  WATCHER_STOP_DIR: (state, action) =>
    update(state, {
      [action.payload]: {
        isStarted: { $set: false },
        totalFiles: { $set: 0 },
        processedFiles: { $set: 0 },
      }
    }),

  WATCHER_SET_HISTORY: (state, action) =>
    update(state, {
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
    }),

  WATCHER_UNSET_HISTORY: (state, action) =>
    update(state, {
      [action.payload]: {
        history: {
          $set: {}
        }
      }
    }),

  WATCHER_SET_HISTORY_ERROR: (state, action) =>
    update(state, {
      [action.payload.index]: {
        history: {
          [action.payload.filepath]: {
            error: {
              $set: action.payload.error
            }
          }
        }
      }
    }),

  WATCHER_ADD_HISTORY_STDOUT: (state, action) => {
    return update(state, {
      [action.payload.index]: {
        history: {
          [action.payload.filepath]: {
            stdout: {
              $push: [action.payload.stdout.split(`\n`)]
            }
          }
        }
      }
    })
  },

  WATCHER_SET_CONFIG: (state, action) =>
    update(state, {
      [action.payload.index]: {
        config: { $set: createConfig(action.payload.config) },
      }
    }),

  WATCHER_SET_DIRTY_CONFIG: (state, action) =>
    update(state, {
      [action.payload]: {
        isSaved: { $set: true },
      }
    }),

  WATCHER_UNSET_DIRTY_CONFIG: (state, action) =>
    update(state, {
      [action.payload]: {
        isSaved: { $set: false },
      }
    }),

  SET_TOTAL_FILES: (state, action) =>
    update(state, {
      [action.payload.index]: {
        totalFiles: { $set: action.payload.numFiles }
      }
    }),

  SET_PROCESSED_FILES: (state, action) =>
    update(state, {
      [action.payload.index]: {
        processedFiles: { $set: action.payload.numFiles },
        totalFiles: {
          $apply: (x) => (action.payload.numFiles > x ? action.payload.numFiles : x)
        }
      }
    }),

}, defaultState)
