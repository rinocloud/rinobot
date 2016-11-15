import { handleActions } from 'redux-actions';
import update from 'react-addons-update'
import _ from 'lodash'
import pt from 'path'

const defaultState = {
  basePath: null,
  currentPath: null,
  lastSelectedItem: null,
  sortedBy: 'Type'
}

export default handleActions({

  FS_SET_SORTED_BY: (state, action) =>
    update(state, {
      sortedBy: {
        $set: action.payload
      }
    }),

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
      lastSelectedItem: {
        $set: null
      }
    }),

  FS_SET_ITEMS: (state, action) =>
    update(state, {
      items: {
        $apply: (prevList = {}) => {
          const items = _.reduce(action.payload, (collector, newItem, itemName) => {
            collector[itemName] = update(prevList[itemName] || {}, { // eslint-disable-line
              name: { $set: newItem.name },
              path: { $set: newItem.path },
              type: { $set: newItem.type },
              size: { $set: newItem.size },
            })

            return collector
          }, {})

          const itemsArray = _.map(items)

          const sortedItemsArray = _.sortBy(itemsArray, [(item) => {
            if (state.sortedBy === 'Type') {
              return pt.extname(item.name)
            }
            if (state.sortedBy === 'Name') {
              return item.name
            }
          }])

          const sortedItems = _.keyBy(sortedItemsArray, 'path')

          return sortedItems
        }
      }
    }),

  FS_SET_ITEM_STARTED: (state, action) =>
    update(state, {
      items: {
        [action.payload]: {
          state: { $set: 'started' }
        }
      }
    }),

  FS_SET_ITEM_COMPLETE: (state, action) =>
    update(state, {
      items: {
        [action.payload]: {
          state: { $set: 'complete' }
        }
      }
    }),

  FS_SET_ITEM_ERROR: (state, action) =>
    update(state, {
      items: {
        [action.payload]: {
          state: { $set: 'error' }
        }
      }
    }),

  FS_SET_ITEM_LOG: (state, action) =>
    update(state, {
      items: {
        [action.payload.path]: {
          log: { $apply: (prevLog = '') => `${prevLog}\n${action.payload.log}` }
        }
      }
    }),

  FS_ITEM_SINGLE_SELECT: (state, action) =>
    update(state, {
      items: {
        $apply: (prevList) => {
          return _.reduce(prevList, (collector, val, key) => {
            collector[key] = { // eslint-disable-line
              ...val,
              selected: key === action.payload
            }
            return collector
          }, {})
        }
      },
      lastSelectedItem: {
        $set: action.payload
      }
    }),

  FS_ITEM_CTRL_SELECT: (state, action) =>
    update(state, {
      items: {
        [action.payload]: {
          selected: {
            $apply: x => !x
          }
        }
      },
      lastSelectedItem: {
        $set: action.payload
      }
    }),

  FS_ITEM_DRAG_SELECT: (state, action) =>
    update(state, {
      items: {
        $apply: (prevList) => {
          return _.reduce(prevList, (collector, val, key) => {
            collector[key] = { // eslint-disable-line
              ...val,
              selected: action.payload.includes(key)
            }
            return collector
          }, {})
        }
      },
      lastSelectedItem: {
        $set: action.payload[action.payload.length - 1]
      }
    }),

  FS_ITEM_SHIFT_SELECT: (state, action) =>
    update(state, {
      items: {
        $apply: (prevList) => {
          const currSelectedIndex = _.map(prevList, 'path').indexOf(action.payload)
          const lastSelectedIndex = _.map(prevList, 'path').indexOf(state.lastSelectedItem)

          let start = currSelectedIndex
          let end = lastSelectedIndex

          if (start >= end) {
            start = lastSelectedIndex
            end = currSelectedIndex
          }

          const newArray = _.map(_.map(prevList), (val, index) => {
            if (index >= start && index <= end) {
              return {
                ...val,
                selected: true
              }
            }
            return val
          })

          return _.reduce(newArray, (collector, val) => {
            collector[val.path] = val // eslint-disable-line
            return collector
          }, {})
        }
      },
      lastSelectedItem: {
        $set: action.payload
      }
    }),


  FS_UNSELECT_ALL: (state) =>
    update(state, {
      items: {
        $apply: (prevList) => {
          return _.reduce(prevList, (collector, val, key) => {
            collector[key] = { // eslint-disable-line
              ...val,
              selected: false
            }
            return collector
          }, {})
        }
      },
      lastSelectedItem: {
        $set: null
      }
    }),

}, defaultState)
