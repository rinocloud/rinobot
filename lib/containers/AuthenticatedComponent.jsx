import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'

import { Sidebar } from '../components/Sidebar'
import { Notifications } from '../components/Notifications'

// import * as watcherActions from '../actions/watcher'
import * as authActions from '../actions/auth'
import * as uiActions from '../actions/ui'

export function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {

    static propTypes = {
      auth: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      ui: PropTypes.object.isRequired,
      watcher: PropTypes.array.isRequired,
      location: PropTypes.object.isRequired,
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
      const { actions, auth, ui, watcher, location } = this.props
      return (
        <div className="wrapper main-container">
          <Notifications
            notification={ui.notification}
            installUpdate={actions.installUpdate}
            updateNotes={ui.updateNotes}
            updateShowing={ui.updateShowing}
            updateVersion={ui.updateVersion}
          />

          <div className="sidebar p-0 m-0">
            <Sidebar
              pathname={location.pathname}
              currentDir={ui.currentDir}
              rinobotVersion={ui.rinobotVersion}
              watcher={watcher}
              auth={auth}
              logout={actions.logout}
              setCurrentDir={actions.setCurrentDir}
              addDir={actions.addDir}
            />
          </div>

          <div
            className="container-fluid p-t"
            style={{ minHeight: '100vh', marginBottom: '-50px' }}
          >
            {auth.access_token
                ? <Component {...this.props} />
                : null
            }
          </div>
          {/* <Footer ui={ui} /> */}
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
