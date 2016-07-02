import request from 'superagent'
import constants from '../constants'
import { createAction } from 'redux-actions'
import { push } from 'react-router-redux'

export const toggleAuthenticating = createAction('AUTH_TOGGLE_AUTHENTICATING')
export const unsetOAuth = createAction('AUTH_UNSET_OAUTH')
export const setOAuth = createAction('AUTH_SET_OAUTH')
export const setError = createAction('AUTH_SET_ERROR')

export const logout = (action) => {
  return (dispatch, getState) => {
    dispatch(unsetOAuth())
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
      .end((err, res)=>{
        dispatch(toggleAuthenticating())
        if(err) return dispatch(setError(res.body.error_description))
        dispatch(setOAuth(res.body))
        setTimeout(function(){
          dispatch(push(action.next))
        }.bind(this), 50)
      })
  }
}
