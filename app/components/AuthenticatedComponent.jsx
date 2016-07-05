import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Link } from 'react-router'
import * as authActions from '../actions/auth'


export function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {

    static propTypes = {
      dispatch: PropTypes.func.isRequired,
      auth: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
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
      const { dispatch, auth } = this.props

      const onClickLogout = (e) => {
        e.preventDefault()
        dispatch(authActions.logout())
      }

      return (
        <div>
          <div className="header">
            <div>
              <Link to="/"><i className="icon-brand"></i></Link>
              <Link to="/" className="m-l btn btn-sm">Watch folders</Link>
              <Link to="/plugins" className="m-l btn btn-sm">Install plugin</Link>
              <Link to="/installed_plugins" className="m-l btn btn-sm">My plugins</Link>
              <a href="#" className="pull-right" onClick={onClickLogout}>{auth.isAuthenticating ?
                <span>Logging out <i className="fa fa-spinner fa-spin"></i></span>
                :
                <span>Logout</span>
              }</a>
            </div>
            {auth.statusText}
          </div>
          {auth.access_token
              ? <Component {...this.props} />
              : null
          }
        </div>
      )
    }
  }

  return connect((state) => ({
    auth: state.auth
  }))(AuthenticatedComponent)
}
