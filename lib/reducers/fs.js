import { handleActions } from 'redux-actions';
import update from 'react-addons-update'
import _ from 'lodash'

const defaultState = {
  basePath: null,
  currentPath: null
}

export default handleActions({
  FS_SET_BASE_PATH: (state, action) =>
    update(state, {
      basePath: {
        $set: action.payload
      },
      currentPath: {
        $set: action.payload
      },
    }),

  FS_SET_CURRENT_PATH: (state, action) =>
    update(state, {
      currentPath: {
        $set: action.payload
      },
    }),

  FS_SET_ITEMS: (state, action) =>
    update(state, {
      items: {
        $apply: (prevList) => {
          return _.reduce(action.payload, (collector, val, key) => {
            let selected = false
            if (prevList && _.has(prevList, key)) {
              selected = prevList[key].selected
            }
            collector[key] = {
              ...val,
              selected
            }
            return collector
          }, {})
        }
      },
    }),

  FS_TOGGLE_ITEM_SELECTED: (state, action) =>
    update(state, {
      items: {
        [action.payload]: {
          selected: {
            $apply: (x) => !x
          }
        }
      }
    })
}, defaultState)
