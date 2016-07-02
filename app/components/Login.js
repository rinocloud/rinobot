import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import * as authActions from '../actions/auth.js'


export const Login = React.createClass({
  handleSubmit(e){
    e.preventDefault()
    const { dispatch } = this.props
    const next = this.props.location.query.next || '/';

    dispatch(authActions.login({
      email: this._email.value,
      password: this._password.value,
      next: next
    }))
  },

  render() {
    const {dispatch, auth} = this.props

    return (
      <div className="container">
        <div className="col-sm-6 col-sm-offset-3">

          <h1 className="text-center">
            Login
          </h1>

          <form className="m-t" onSubmit={this.handleSubmit}>

            <div className="form-group">
              <input className="form-control" placeholder="email" ref={(c) => this._email = c} type="email"/>
            </div>

            <div className="form-group">
              <input className="form-control" placeholder="password" ref={(c) => this._password = c} type="password"/>
            </div>

            <button className="btn btn-primary" type="submit">
              {auth.isAuthenticating ?
              <span>Login <i className="fa fa-spinner fa-spin"></i></span>
              :
              <span>Login <i className="fa fa-arrow-right"></i></span>
            }
            </button>
            <div className="m-t">{auth.statusText}</div>

          </form>

        </div>

      </div>
    )
  }
})

export default connect((state)=>({
  auth: state.auth
}))(Login)
