import { handleActions } from 'redux-actions';

const defaultState = {

  // we will query the token to see if the use is authenticated

  email: null,
  token: null,
  access_token: null,
  refresh_token: null,
  scope: null,
  expires_in: null,
  token_type: null,
  // this is when the user wants a local session without logging in going to
  // leave it false for a while
  authLess: false,
  isAuthenticating: false,
  statusText: null
}

/* Reduce */
export default handleActions({

  AUTH_TOGGLE_AUTHENTICATING: (state, action) => ({
    ...state,
    isAuthenticating: !state.isAuthenticating
  }),

  AUTH_SET_AUTH: (state, action) => {
    return {
      ...state,
      email: action.payload.email,
      token: action.payload.token,
      access_token: action.payload.access_token,
      refresh_token: action.payload.refresh_token,
      scope: action.payload.scope,
      expires_in: action.payload.expires_in,
      token_type: action.payload.token_type,
    }
  },

  AUTH_UNSET_AUTH: (state, action) => ({
    ...state,
    access_token: null,
    refresh_token: null,
    scope: null,
    expires_in: null,
    token_type: null,
  }),

  AUTH_SET_ERROR: (state, action) => ({
      ...state,
      statusText: action.payload
  })

}, defaultState)
