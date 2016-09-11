import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { Notifications } from './Notifications'

export function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {

    static propTypes = {
      dispatch: PropTypes.func.isRequired,
      auth: PropTypes.object.isRequired,
      ui: PropTypes.object.isRequired,
      watcher: PropTypes.object.isRequired,
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
      const { dispatch } = this.props

      if (!token) {
        const redirectAfterLogin = this.props.location.pathname
        dispatch(push(`/login?next=${redirectAfterLogin}`))
      }
    }

    render() {
      const { auth, ui, dispatch, watcher, location } = this.props
      return (
        <div className="wrapper main-container">
          <Notifications
            ui={ui}
            dispatch={dispatch}
          />

          <div className="sidebar p-0 m-0">
            <Sidebar
              location={location}
              ui={ui}
              watcher={watcher}
              dispatch={dispatch}
              auth={auth}
            />
          </div>

          <div
            className="container-fluid p-t"
            style={{ minHeight: '100vh', marginBottom: '-50px' }}
          >
            {auth.statusText}
            {auth.access_token
                ? <Component {...this.props} />
                : null
            }
          </div>
          <Footer ui={ui} />
        </div>
      )
    }
  }

  return connect((state) => ({
    auth: state.auth,
    ui: state.ui,
    watcher: state.watcher,
  }))(AuthenticatedComponent)
}
