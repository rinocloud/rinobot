import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Navbar } from './Navbar'
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
      const { auth, ui, dispatch, watcher } = this.props
      return (
        <div className="container">
          <div className="wrapper">
            <Navbar ui={ui} watcher={watcher} dispatch={dispatch} auth={auth} />
            <Notifications ui={ui} dispatch={dispatch} />
            {auth.statusText}
            {auth.access_token
                ? <Component {...this.props} />
                : null
            }
            <div className="push"></div>
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
