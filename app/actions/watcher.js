import { createAction } from 'redux-actions';
import * as rinoEvents from './rino-events'

var mainProcessChokidar = require('electron').remote.require('./app/actions/chokidar-binding')
mainProcessChokidar.close()

export const setToken = createAction('WATCHER_SET_TOKEN');
export const addPaths = createAction('WATCHER_ADD_PATHS');
export const addLogs = createAction('WATCHER_ADD_LOGS');
export const startBusy = createAction('WATCHER_START_BUSY');
export const stopBusy = createAction('WATCHER_STOP_BUSY');


export const startWatching = (action) => {
  return (dispatch, getState) => {

    const w = mainProcessChokidar.getChokidar()
      .watch(action, {ignored: /[\/\\].*.rino/, ignoreInitial:true, usePolling: true})
      .on('all', (event, path, stats) => {

        rinoEvents.handleEvent(event, path, stats, (string)=>{
          dispatch(addLogs([string]))
          dispatch(startBusy())

          setTimeout(()=>{
            dispatch(stopBusy())
          }, 5000)
        })
      })

    dispatch(addPaths(action))
    mainProcessChokidar.addWatch(w)
  }
}
