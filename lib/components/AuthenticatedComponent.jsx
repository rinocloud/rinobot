import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Navbar } from './Navbar'
import { Notifications } from './Notifications'

export function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {

    static propTypes = {
      dispatch: PropTypes.func.isRequired,
      auth: PropTypes.object.isRequired,
      ui: PropTypes.object.isRequired,
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
      const { auth, ui, dispatch } = this.props
      return (
        <div>
          <div className="container">
            <Navbar dispatch={dispatch} auth={auth} />
            <Notifications ui={ui} dispatch={dispatch} />
            {auth.statusText}
            {auth.access_token
                ? <Component {...this.props} />
                : null
            }
          </div>
        </div>
      )
    }
  }

  return connect((state) => ({
    auth: state.auth,
    ui: state.ui
  }))(AuthenticatedComponent)
}
