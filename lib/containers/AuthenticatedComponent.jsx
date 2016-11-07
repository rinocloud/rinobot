import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { Sidebar } from '../components/Sidebar'
import * as authActions from '../actions/auth'
import * as uiActions from '../actions/ui'

export function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {

    static propTypes = {
      location: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      watcher: PropTypes.array.isRequired,
      auth: PropTypes.object.isRequired,
      ui: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props)
      this.checkAuth = this.checkAuth.bind(this)
    }

    componentWillMount() {
      this.checkAuth(this.props.auth.access_token)
    }

    componentWillReceiveProps(nextProps) {
      this.checkAuth(nextProps.auth.access_token)
    }

    checkAuth(token) {
      if (!token) {
        const redirectAfterLogin = this.props.location.pathname
        this.props.actions.push(`/login?next=${redirectAfterLogin}`)
      }
    }

    render() {
      const { actions, auth, ui, location } = this.props
      return (
        <div className="wrapper main-container">
          <div className="sidebar p-0 m-0">
            <Sidebar
              auth={auth}
              rinobotVersion={ui.rinobotVersion}
              pathname={location.pathname}
              logout={actions.logout}
            />
          </div>

          <div className="container-fluid p-t main-component">
            {auth.access_token && <Component {...this.props} />}
          </div>
        </div>
      )
    }
  }

  const mapStateToProps = (state) => ({
    auth: state.auth,
    ui: state.ui,
    watcher: state.watcher,
  })

  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
      push,
      ...authActions,
      ...uiActions
    }, dispatch)
  })

  return connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent)
}
