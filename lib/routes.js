import React, { PropTypes } from 'react'
import { Route, IndexRoute } from 'react-router'

import Login from './components/Login'
import Watcher from './components/Watcher'
import Plugins from './components/Plugins'
import MakePlugin from './components/MakePlugin'
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
    <Route path="/plugins" component={requireAuthentication(Plugins)} />
    <Route path="/make" component={requireAuthentication(MakePlugin)} />
    <Route path="/login" component={Login} />
  </Route>
)
