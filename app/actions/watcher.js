import { createAction } from 'redux-actions';
import pt from 'path'
import colors from 'colors'
import {Pipeline} from 'rinobot/dist/pipeline'

// We require the watcher chokidar bindings from the main electron process it goes
// crazy if we require from within a window
var mainProcessChokidar = require('electron').remote.getGlobal('mainProcessChokidar')
mainProcessChokidar.close()

colors.enabled = true
colors.mode = 'browser'

// Define non-async actions
export const addPaths = createAction('WATCHER_ADD_PATHS');
export const addLogs = createAction('WATCHER_ADD_LOGS');
export const addDevLogs = createAction('WATCHER_ADD_DEV_LOGS');
export const clearLogs = createAction('WATCHER_CLEAR_LOGS');
export const startBusy = createAction('WATCHER_START_BUSY');
export const stopBusy = createAction('WATCHER_STOP_BUSY');
export const removeByIndex = createAction('WATCHER_REMOVE_BY_INDEX');
export const toggleDevLog = createAction('WATCHER_TOGGLE_SHOW_DEV_LOGS');

// Define async actions
export const syncPathsWithChokidar = () => {
  return (dispatch, getState) => {}
}

export const stopWatching = (action) => {
  // stops watching a directory
  return (dispatch, getState) => {
    dispatch(removeByIndex(action))
    mainProcessChokidar.close()
  }
}

const createPipeline = (action, dispatch, event, path, stats) => {
  const p = new Pipeline({
    watchPath: action[0],
    event,
    path,

    on_log: (pipeline, msg)=>{ dispatch(addLogs([`${pipeline.relPath}: ${msg}`])) },
    on_complete: (pipeline)=>{ dispatch(addLogs([`${pipeline.relPath}: complete`.green])) },
    on_error: (pipeline, error)=>{ dispatch(addLogs([`${pipeline.relPath}: ${error}`.red])) },
    on_ignore: (pipeline, msg)=>{ dispatch(addLogs([`${pipeline.relPath}: ${msg}`])) },

    on_rule_complete: (pipeline, rule)=>{ dispatch(addLogs([`${pipeline.relPath}: rule: ${rule.command} complete`.green])) },
    on_rule_error: (pipeline, rule, error)=>{ dispatch(addLogs([`${pipeline.relPath}: rule: ${rule} ${error}`.red])) },
    on_rule_ignore: (pipeline, rule, msg)=>{ dispatch(addLogs([`${pipeline.relPath}: rule: ${rule.command} ${msg}`])) },
  })
}

export const startWatching = (action) => {
  return (dispatch, getState) => {
    const w = mainProcessChokidar.getChokidar()
      .watch(action, {ignored: /[\/\\].*.rino/, ignoreInitial:false, usePolling: true})
      .on('all', createPipeline.bind(null, action, dispatch))
      .on('ready', ()=>{
        dispatch(addLogs([`Started watching ${action}`.green]))
      })

    dispatch(addPaths(action))
    mainProcessChokidar.addWatch(w)
  }
}
