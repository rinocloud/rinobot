import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { requireAuthentication } from './containers/AuthenticatedComponent'
import FileSystem from './containers/FileSystem'
import Settings from './containers/Settings'
import Notebook from './containers/Notebook'
import Plugins from './containers/Plugins'
import Login from './containers/Login'
import App from './containers/App'


export default (
  <Route path="/" component={App}>
    <IndexRoute component={requireAuthentication(FileSystem)} />
    <Route path="/plugins" component={requireAuthentication(Plugins)} />
    <Route path="/settings" component={requireAuthentication(Settings)} />
    <Route path="/notebook" component={requireAuthentication(Notebook)} />
    <Route path="/login" component={Login} />
  </Route>
)
