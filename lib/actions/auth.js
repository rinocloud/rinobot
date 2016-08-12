import { createAction } from 'redux-actions'
import { push } from 'react-router-redux'
import constants from '../constants'
import request from 'superagent'
import rpc from '../rpc'
import fs from 'fs'

export const toggleAuthenticating = createAction('AUTH_TOGGLE_AUTHENTICATING')
export const unsetAuth = createAction('AUTH_UNSET_AUTH')
export const _setAuth = createAction('AUTH_SET_AUTH')

export const setAuth = (payload) => (dispatch) => {
  if (window.Raven) {
    window.Raven.setUserContext({
      email: payload.email,
      project: payload.project,
      projectId: payload.projectId || null,
      username: payload.username,
      userId: payload.userId || null,
    })

    window.mixpanel.identify(payload.userId)
    window.mixpanel.people.set({
      $email: payload.email,
      $name: payload.email,
      'Project Name': payload.project,
      'Project ID': payload.projectId || null,
      Username: payload.username,
      'User ID': payload.userId || null,
    })

    window.mixpanel.track('Login')
  }

  dispatch(_setAuth(payload))
}

export const setError = createAction('AUTH_SET_ERROR')

export const persistAuth = () => (dispatch, getState) => {
  const str = JSON.stringify(getState().auth)
  fs.writeFile(constants.authFilePath, str, 'utf-8', (err) => {
    if (err) dispatch(setError(err.message))
  })
}

export const readLocalAuth = () => (dispatch) => {
  try {
    const authJSON = JSON.parse(fs.readFileSync(constants.authFilePath, 'utf-8'))
    dispatch(setAuth(authJSON))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

export const clearPersistantAuth = () => (dispatch) => {
  fs.unlink(constants.authFilePath, (err) => {
    if (err) dispatch(setError(err.message))
  })
}

export const logout = () => (dispatch, getState) => {
  dispatch(setError(''))
  dispatch(toggleAuthenticating())
  request
    .post('https://rinocloud.com/o/revoke_token/')
    .type('form')
    .send({
      token: getState().auth.access_token,
      client_id: constants.oauth2.client_id,
    })
    .end((err, res) => {
      dispatch(toggleAuthenticating())
      if (err) return dispatch(setError(res.body.error_description))
      dispatch(setAuth(res.body))
      setTimeout(() => {
        dispatch(push('/'))
        dispatch(clearPersistantAuth())
        if (window.Raven) window.Raven.setUserContext()
        rpc.emit('logout')
      }, 50)
    })
}

export const login = (action) => (dispatch) => {
  dispatch(setError(''))
  dispatch(toggleAuthenticating())

  request
    .post('https://rinocloud.com/o/token/')
    .type('form')
    .send({
      username: action.email,
      password: action.password,
      grant_type: constants.oauth2.grant_type,
      client_id: constants.oauth2.client_id,
    })
    .end((err, res1) => {
      if (err) {
        dispatch(toggleAuthenticating())
        return dispatch(setError(res1.body.error_description))
      }
      dispatch(getToken({
        ...res1,
        ...action
      }))
    })
}

export const getToken = (action) => (dispatch) => {
  request
    .post('https://rinocloud.com/api/1/users/details/')
    .set('Authorization', `Bearer ${action.body.access_token}`)
    .end((err, res2) => {
      dispatch(toggleAuthenticating())
      if (err) return dispatch(setError(err.message))
      const userData = {
        ...action.body,
        ...res2.body,
        email: action.email
      }
      dispatch(setAuth(userData))
      rpc.emit('login', userData)

      setTimeout(() => {
        dispatch(push(action.next))
        dispatch(persistAuth(action.email))
      }, 50)
    })
}
