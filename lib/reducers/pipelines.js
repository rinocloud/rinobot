import { handleActions } from 'redux-actions'
import update from 'react-addons-update'
import _ from 'lodash'

const defaultState = {}

export default handleActions({
  PIPELINES_SET: (state, action) => _.keyBy(action.payload, 'name'),

  PIPELINES_ADD: (state, action) =>
    update(state, {
      [action.payload.name]: {
        $set: action.payload
      }
    }),

}, defaultState)
