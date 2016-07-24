import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import createGather from './gather-middleware'
import createLogger from 'redux-logger'
import createDebounce from 'redux-debounce'
import createThrottle from 'redux-throttle'
import { hashHistory } from 'react-router'


import { routerMiddleware } from 'react-router-redux'
import rootReducer from '../reducers'

const router = routerMiddleware(hashHistory)
const gather = createGather()
const throttle = createThrottle()
const logger = createLogger({
  collapsed: true
})
const debounce = createDebounce({
  wait: 200,
  trailing: true,
  leading: false
})
const enhancer = compose(applyMiddleware(
  thunk,
  gather,
  debounce,
  throttle,
  router,
  logger
))

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
    )
  }
  return store
}
