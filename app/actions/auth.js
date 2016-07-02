import request from 'superagent'
import constants from '../constants'
import { createAction } from 'redux-actions'
import { push } from 'react-router-redux'

import fs from 'fs';

export const toggleAuthenticating = createAction('AUTH_TOGGLE_AUTHENTICATING')
export const unsetAuth = createAction('AUTH_UNSET_AUTH')
export const setAuth = createAction('AUTH_SET_AUTH')
export const setError = createAction('AUTH_SET_ERROR')


export const persistAuth = (action) => {
  return (dispatch, getState) => {
    const str = JSON.stringify(getState().auth)
    fs.writeFile(constants.authFilePath, str, 'utf-8', function(err){
      if (err) dispatch(setError(err.message))
    })
  }
}

export const clearPersistantAuth = (action) => {
  return (dispatch, getState) => {


    fs.unlink(constants.authFilePath, function(err){
      if (err) dispatch(setError(err.message))
    })
  }
}

export const logout = (action) => {
  return (dispatch, getState) => {
    dispatch(setError(""))
    dispatch(toggleAuthenticating())

    request
      .post('https://rinocloud.com/o/revoke_token/')
      .type('form')
      .send({
        token: getState().auth.access_token,
        client_id: constants.oauth2.client_id,
      })
      .end((err, res)=>{
        dispatch(toggleAuthenticating())
        if(err) return dispatch(setError(res.body.error_description))
        dispatch(setAuth(res.body))
        setTimeout(function(){
          dispatch(push('/'))
          dispatch(clearPersistantAuth())
        }.bind(this), 50)
      })

  }
}

export const login = (action) => {
  return (dispatch, getState) => {

    dispatch(setError(""))
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
      .end((err, res1)=>{
        if(err) return dispatch(setError(res.body.error_description))

        request
          .post('https://rinocloud.com/api/1/users/token/')
          .set('Authorization', `Bearer ${res1.body.access_token}`)
          .end((err, res2)=>{

            dispatch(toggleAuthenticating())
            if(err) return dispatch(setError(err.message))

            dispatch(setAuth({
              ...res1.body,
              ...res2.body,
              email: action.email
            }))

            setTimeout(function(){
              dispatch(push(action.next))
              dispatch(persistAuth(action.email))
            }.bind(this), 50)

          })
      })
  }
}
