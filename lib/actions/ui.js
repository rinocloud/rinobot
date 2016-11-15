import React from 'react'
import { createAction } from 'redux-actions'
import rpc from '../rpc';
import mixpanel from 'mixpanel-browser'


export const errorToNotification = (error) => (dispatch) => {
  dispatch(addNotification({
    title: error.name,
    message: error.message,
    level: 'error',
    position: 'bl'
  }))
}


export const addNotification = createAction('UI_ADD_NOTIFICATION')


export const addError = createAction('UI_ADD_ERROR')


export const addWarning = createAction('UI_ADD_WARNING')


export const addLog = createAction('UI_ADD_LOG')


/*
  Python
*/


export const pythonVersion = (payload) => (dispatch) => {
  let pythonMajorVersion = null
  if (payload.version) {
    pythonMajorVersion = payload.version.split('.')[0]
  }

  const pythonLink = (
    <a
      href="https://www.continuum.io/downloads#_windows"
      onClick={(ev) => {
        ev.preventDefault()
        window.require('electron').shell.openExternal(ev.target.href)
      }}
      className="text-muted"
      style={{
        textDecoration: 'underline'
      }}
    >
      Python 3
    </a>
  )

  if (payload.version === false) {
    dispatch(addNotification({
      title: 'Plugins: No python install found',
      message: (
        <span>
          No python found, please install {pythonLink} to use plugins.
        </span>
      ),
      level: 'warning',
      autoDismiss: 0,
      position: 'bl',
    }))
  } else if (pythonMajorVersion === '2') {
    dispatch(addNotification({
      title: 'Plugins: Python 2 found.',
      message: (
        <span>
          Please install {pythonLink} to use plugins.
        </span>
      ),
      level: 'warning',
      autoDismiss: 0,
      position: 'bl',
    }))
  } else {
    return dispatch(createAction('UI_PYTHON_VERSION'))
  }
}


/*
  Current Rinobot version
*/


export const rinobotVersion = createAction('UI_RINOBOT_VERSION')


/*
  Start/stop watcher
*/


export const startStarting = createAction('UI_WATCHER_IS_STARTING')


export const stopStarting = createAction('UI_WATCHER_NOT_STARTING')


/*
  Updates
*/


export const updateAvailable = (payload) => (dispatch, getState) => {
  mixpanel.track('Update available', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: payload.version,
  })

  dispatch(addNotification({
    title: `Version ${payload.version} ready`,
    message: (
      <span>
        {payload.updateNotes && ` ${payload.updateNotes.trim().replace(/\.$/, '')}`}
        {'  '}
        <a
          onClick={(ev) => {
            ev.preventDefault()
            window.require('electron').shell.openExternal(ev.target.href)
          }}
          href={`https://github.com/rinocloud/rinobot/releases/tag/${payload.version}`}
        >
          (notes)
        </a>.
      </span>
    ),
    action: {
      label: 'Restart and update',
      callback: () => {
        dispatch(installUpdate())
      }
    },
    level: 'success',
    autoDismiss: 0,
    position: 'bl',
    dismissible: false
  }))

  return dispatch(createAction('UI_UPDATE_AVAILABLE')(payload))
}


export const installUpdate = () => (dispatch, getState) => {
  mixpanel.track('Installing update', {
    currentVersion: getState().ui.rinobotVersion,
    updateVersion: getState().ui.updateVersion,
  })

  rpc.emit('quit and install')
}


/*
  Current directory in view
*/


export const setCurrentDir = (payload) => (dispatch, getState) => {
  const dirsLength = getState().watcher.length
  let index = payload

  if (payload === 'latest') {
    if (dirsLength > 0) {
      index = dirsLength - 1
    } else {
      index = 0
    }
  } else if (payload > dirsLength) {
    index = dirsLength - 1
  } else {
    index = payload
  }

  dispatch(createAction('UI_SET_CURRENT_DIR')(index))

  const conf = getState().watcher[index].config
  dispatch(createAction('PIPELINE_FORM_SET')({ ...conf }))
}
