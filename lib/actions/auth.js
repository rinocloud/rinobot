import { createAction } from 'redux-actions'
import { push } from 'react-router-redux'
import constants from '../constants'
import request from 'superagent'
import rpc from '../rpc'

import {
  assignUser,
  unassignUser
} from './analytics'

import {
  writeAuth,
  readAuth,
  rmAuth
 } from './utils'

/*
  UI toggle
*/


export const toggleAuthenticating = createAction('AUTH_TOGGLE_AUTHENTICATING')


/*
  Error
*/


export const setError = createAction('AUTH_SET_ERROR')


/*
  Login
*/


export const setAuth = (payload) => (dispatch) => {
  if (payload !== null) {
    assignUser(payload)
    dispatch(createAction('AUTH_SET_AUTH')(payload))
  }
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
    .end((err, response) => {
      if (err) {
        dispatch(toggleAuthenticating())
        dispatch(setError(response.body.error_description))
      } else {
        dispatch(getToken({
          ...response,
          ...action
        }))
      }
    })
}


export const getToken = (action) => (dispatch) => {
  request
    .post('https://rinocloud.com/api/1/users/details/')
    .set('Authorization', `Bearer ${action.body.access_token}`)
    .end((err, ressponse) => {
      if (err) {
        dispatch(toggleAuthenticating())
        dispatch(setError(err.message))
      } else {
        const userData = {
          ...action.body,
          ...ressponse.body,
          email: action.email
        }
        dispatch(setAuth(userData))
        rpc.emit('login', userData)
        setTimeout(() => {
          dispatch(toggleAuthenticating())
          dispatch(push(action.next))
          dispatch(persistAuth(action.email))
        }, 50)
      }
    })
}


/*
  Logout
*/


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
    .end((err, response) => {
      if (err) {
        dispatch(toggleAuthenticating())
        dispatch(setError(response.body.error_description))
      } else {
        dispatch(setAuth(response.body))
        setTimeout(() => {
          dispatch(toggleAuthenticating())
          dispatch(push('/'))
          dispatch(clearPersistantAuth())
          unassignUser()
          rpc.emit('logout')
        }, 50)
      }
    })
}


/*
  Persist authentication
*/


export const persistAuth = () => (dispatch, getState) => {
  writeAuth(getState().auth, (err) => {
    if (err) dispatch(setError(err.message))
  })
}


export const readLocalAuth = () => (dispatch) => {
  readAuth((err, auth) => {
    if (!err) dispatch(setAuth(auth))
    else dispatch(setError(err.message))
  })
}


export const clearPersistantAuth = () => (dispatch) => {
  rmAuth((err) => {
    if (err) dispatch(setError(err.message))
  })
}
