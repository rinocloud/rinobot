import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import * as authActions from '../actions/auth.js'
import { Link } from 'react-router'
const { shell } = require('electron')


export class Login extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()
    const { dispatch } = this.props
    const next = this.props.location.query.next || '/';

    dispatch(authActions.login({
      email: this._email.value,
      password: this._password.value,
      next
    }))
  }

  render() {
    const { auth } = this.props
    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    return (
      <div className="">
        <div className="container m-t-lg">
          <div>
            <a href="https://rinocloud.com/accounts/signup/" className="pull-right" onClick={openExternal}>
              Don't have a Rinocloud account? Sign up.
            </a>
          </div>
        </div>

        <div className="col-sm-6 col-sm-offset-3 m-t">
          <h3 className="">
            Login to Rinocloud
          </h3>
          <form className="m-t" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <input
                className="form-control"
                placeholder="email"
                ref={(c) => { this._email = c }}
                type="email"
              />
            </div>

            <div className="form-group">
              <input
                className="form-control"
                placeholder="password"
                ref={(c) => { this._password = c }}
                type="password"
              />
            </div>

            <button className="btn btn-success btn-" type="submit">
              {auth.isAuthenticating ?
                <span>Login <i className="fa fa-spinner fa-spin"></i></span>
              :
                <span>Login <i className="fa fa-arrow-right"></i></span>
              }
            </button>
            <div className="m-t">{auth.statusText}</div>
            <a href="https://rinocloud.com/accounts/password/reset/" onClick={openExternal}>Forgot password?</a>
          </form>
        </div>
      </div>
    )
  }
}

export default connect((state) => ({
  auth: state.auth
}))(Login)
