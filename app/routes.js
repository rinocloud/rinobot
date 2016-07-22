import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { requireAuthentication } from './components/AuthenticatedComponent'

import Login from './components/Login'
import Watcher from './components/Watcher'
import Plugins from './components/Plugins'
import InstalledPlugins from './components/InstalledPlugins'

var App = React.createClass({
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
})


export default (
  <Route path="/" component={App}>
    <IndexRoute component={requireAuthentication(Watcher)} />
    <Route path="/installed_plugins" component={requireAuthentication(InstalledPlugins)} />
    <Route path="/plugins" component={requireAuthentication(Plugins)} />
    <Route path="/login" component={Login} />
  </Route>
);
