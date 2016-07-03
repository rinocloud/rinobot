import React from 'react'
import { Route, IndexRoute } from 'react-router'
import {requireAuthentication} from './components/AuthenticatedComponent'
import App from './containers/App'
import Login from './components/Login'
import Watcher from './components/Watcher'
import Plugins from './components/Plugins'
import InstalledPlugins from './components/InstalledPlugins'
import Documentation from './components/Documentation'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={requireAuthentication(Watcher)}/>
    <Route path="/documentation" component={requireAuthentication(Documentation)}/>
    <Route path="/installed_plugins" component={requireAuthentication(InstalledPlugins)}/>
    <Route path="/plugins" component={requireAuthentication(Plugins)}/>
    <Route path="/login" component={Login}/>
  </Route>
);
