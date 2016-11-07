/*
  * form reducer
*/

import { handleActions } from 'redux-actions'
import update from 'react-addons-update'


const defaultForm = {
  pipelines: [{
    filematch: null,
    incoming_only: true,
    tasks: [{
      name: null,
      args: {},
      keep: true,
      flow: 'then'
    }]
  }],
  metadata: [],
  isSaved: true
}


export default handleActions({

  PIPELINE_FORM_SET: (state, action) =>
    ({
      ...state,
      ...action.payload,
      isSaved: true,
    }),

  PIPELINE_FORM_ADD_PIPELINE: (state) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        $push: [{
          filematch: null,
          incoming_only: true,
          tasks: [{
            name: null,
            args: {},
            keep: true,
            flow: 'then'
          }]
        }]
      }
    }),

  PIPELINE_FORM_REMOVE_PIPELINE: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        $splice: [[action.payload.index, 1]]
      }
    }),

  PIPELINE_FORM_ADD_PIPELINE_TASK: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          tasks: {
            $push: [{
              name: null,
              args: {},
              keep: true,
              flow: 'then'
            }]
          }
        }
      }
    }),

  PIPELINE_FORM_REMOVE_PIPELINE_TASK: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          tasks: {
            $splice: [[action.payload.taskIndex, 1]]
          }
        }
      }
    }),

  PIPELINE_FORM_CHANGE_PIPELINE_MATCH: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          filematch: { $set: action.payload.newFileMatch }
        }
      }
    }),

  PIPELINE_FORM_CHANGE_PIPELINE_TASK_NAME: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          tasks: {
            [action.payload.taskIndex]: {
              name: { $set: action.payload.name }
            }
          }
        }
      }
    }),

  PIPELINE_FORM_CHANGE_PIPELINE_TASK_ARGS: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          tasks: {
            [action.payload.taskIndex]: {
              args: { [action.payload.argName]: {
                $set: action.payload.argValue
              } }
            }
          }
        }
      }
    }),

  PIPELINE_FORM_CHANGE_PIPELINE_TASK_KEEP: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          tasks: {
            [action.payload.taskIndex]: {
              keep: { $set: action.payload.args }
            }
          }
        }
      }
    }),

  PIPELINE_FORM_CHANGE_PIPELINE_TASK_FLOW: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          tasks: {
            [action.payload.taskIndex]: {
              flow: { $set: action.payload.args }
            }
          }
        }
      }
    }),

  PIPELINE_FORM_CHANGE_PIPELINE_INCOMING_ONLY: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      pipelines: {
        [action.payload.index]: {
          incoming_only: { $set: action.payload.args }
        }
      }
    }),

  PIPELINE_FORM_ADD_METADATA: (state) =>
    update(state, {
      isSaved: { $set: false },
      metadata: {
        $push: [{
          field: null,
          value: null
        }]
      }
    }),

  PIPELINE_FORM_REMOVE_METADATA: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      metadata: {
        $splice: [[action.payload.index, 1]]
      }
    }),

  PIPELINE_FORM_CHANGE_METADATA_FIELD: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      metadata: {
        [action.payload.index]: {
          field: { $set: action.payload.field }
        }
      }
    }),

  PIPELINE_FORM_CHANGE_METADATA_VALUE: (state, action) =>
    update(state, {
      isSaved: { $set: false },
      metadata: {
        [action.payload.index]: {
          value: { $set: action.payload.value }
        }
      }
    }),

}, defaultForm)
