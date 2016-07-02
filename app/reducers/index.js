import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import watcher from './watcher';
import auth from './auth';

const rootReducer = combineReducers({
  watcher,
  auth,
  routing
});

export default rootReducer;
