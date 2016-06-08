import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import watcher from './watcher';

const rootReducer = combineReducers({
  watcher,
  routing
});

export default rootReducer;
