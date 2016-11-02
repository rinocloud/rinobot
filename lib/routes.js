import React, { PropTypes } from 'react'
import { Route, IndexRoute } from 'react-router'

import Login from './containers/Login'
import FileSystem from './containers/FileSystem'
import Plugins from './containers/Plugins'
import MakePlugin from './containers/MakePlugin'
import { requireAuthentication } from './containers/AuthenticatedComponent'

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
    <IndexRoute component={requireAuthentication(FileSystem)} />
    <Route path="/plugins" component={requireAuthentication(Plugins)} />
    <Route path="/make" component={requireAuthentication(MakePlugin)} />
    <Route path="/login" component={Login} />
  </Route>
)
