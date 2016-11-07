import { createAction } from 'redux-actions'
import { push } from 'react-router-redux'
import request from 'superagent'
import _ from 'lodash'
import { assignUser, unassignUser } from './analytics'
import rpc from '../rpc'
import db from './db'


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


export const hydrate = () => (dispatch) => {
  db.auth.find({ loggedIn: true }, (err, doc) => {
    if (doc.length > 0) dispatch(setAuth(doc[0]))
  })
}


export const setAuth = (payload) => (dispatch) => {
  if (payload !== null) {
    assignUser(payload)
    dispatch(createAction('AUTH_SET_AUTH')(payload))

    const userDoc = {
      ..._.omit(payload, '_id'),
      loggedIn: true
    }

    db.auth.update(
      { token: payload.token },
      userDoc,
      { upsert: true },
      (err) => {
        if (err) throw err
      })
  }

  dispatch(push('/'))
}


export const setLoggedOut = () => (dispatch, getState) => {
  const token = getState().auth.token

  db.auth.remove(
    { token },
    { multi: true },
    (err) => {
      if (err) throw err
      dispatch(createAction('AUTH_SET_AUTH')({}))
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
      grant_type: 'password',
      client_id: 'MwtxN8YerqSglvo07qL6mZZlngX08QJpEcTJtKw5',
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
        dispatch(push(action.next))

        dispatch(toggleAuthenticating())
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
      client_id: 'MwtxN8YerqSglvo07qL6mZZlngX08QJpEcTJtKw5',
    })
    .end((err, response) => {
      if (err) {
        dispatch(toggleAuthenticating())
        dispatch(setError(response.body.error_description))
      } else {
        dispatch(setLoggedOut())

        setTimeout(() => {
          dispatch(toggleAuthenticating())
          dispatch(push('/'))
          unassignUser()
          rpc.emit('logout')
        }, 50)
      }
    })
}


/*
  Persist authentication
*/
