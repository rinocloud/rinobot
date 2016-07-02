import React from 'react'
import {connect} from 'react-redux'
import { push } from 'react-router-redux'
import * as authActions from '../actions/auth'


export function requireAuthentication(Component) {

  class AuthenticatedComponent extends React.Component {
    componentWillMount () {
      this.checkAuth(this.props.auth.access_token)
    }

    componentWillReceiveProps (nextProps) {
      this.checkAuth(nextProps.auth.access_token)
    }

    checkAuth (token) {
      const {dispatch} = this.props

      if (!token) {
        let redirectAfterLogin = this.props.location.pathname
        dispatch(push(`/login?next=${redirectAfterLogin}`))
      }
    }

    render () {
      const {dispatch, auth} = this.props

      const onClickLogout = (e) => {
        e.preventDefault()
        dispatch(authActions.logout())
      }

      return (
        <div>
            <div className="header">
              <div>
                <i className="icon-brand"></i>
                <a href="#" className="pull-right" onClick={onClickLogout}>{auth.isAuthenticating ?
                  <span>Logging out <i className="fa fa-spinner fa-spin"></i></span>
                  :
                  <span>Logout</span>
                }</a>
              </div>
              {auth.statusText}
            </div>
            {auth.access_token
                ? <Component {...this.props}/>
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
