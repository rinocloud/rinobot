import { handleActions } from 'redux-actions';
import update from 'react-addons-update'

const defaultState = {
  email: null,
  username: null,
  project: null, // projectName
  userId: null, // rinocloud id of user
  projectId: null, // rinocloud id of project
  token: null, // token used to access rinocloud
  access_token: null, // the oauth token used to get the normal token
  isAuthenticating: false,
  statusText: null
}

/* Reduce */
export default handleActions({

  AUTH_SET_ERROR: (state, action) =>
    update(state, {
      statusText: { $set: action.payload }
    }),

  AUTH_TOGGLE_AUTHENTICATING: (state) =>
    update(state, {
      isAuthenticating: { $apply: is => !is }
    }),

  AUTH_SET_AUTH: (state, action) =>
    update(state, {
      email: { $set: action.payload.email },
      username: { $set: action.payload.username },
      project: { $set: action.payload.project },
      token: { $set: action.payload.token },
      access_token: { $set: action.payload.access_token },
      userId: { $set: action.payload.userId || null },
      projectId: { $set: action.payload.projectId || null },
    }),

}, defaultState)
