import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import createDebounce from 'redux-debounced'
import createThrottle from 'redux-throttle'
import { hashHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import rootReducer from '../reducers'

const throttle = createThrottle(200, { leading: true, trailing: true })
const debouncer = createDebounce()
const router = routerMiddleware(hashHistory)
const enhancer = compose(applyMiddleware(thunk, router, debouncer, throttle))

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
    )
  }
  return store
}
