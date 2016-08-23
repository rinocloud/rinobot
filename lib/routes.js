import React, { PropTypes } from 'react'
import { Route, IndexRoute } from 'react-router'

import Login from './components/Login'
import Watcher from './components/Watcher'
import InstalledPackages from './components/InstalledPackages'
import { requireAuthentication } from './components/AuthenticatedComponent'

class App extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

export default (
  <Route path="/" component={App}>
    <IndexRoute component={requireAuthentication(Watcher)} />
    <Route path="/installed_packages" component={requireAuthentication(InstalledPackages)} />
    <Route path="/login" component={Login} />
  </Route>
)
