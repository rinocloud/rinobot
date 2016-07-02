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

    const onClickForgot = (e) => {

    }

    const onClickSignup = (e) => {

    }

    return (
      <div>


          <div className="header">
            <div>
              <i className="icon-brand"></i>
              <a href="#" className="pull-right" onClick={onClickSignup}>
                Don't have a Rinocloud account? Sign up.
              </a>
            </div>
          </div>

          <div className="col-sm-4 col-sm-offset-4 m-t">

          <h2 className="">
            Login to Rinocloud
          </h2>

          <form className="m-t" onSubmit={this.handleSubmit}>

            <div className="form-group">
              <input className="form-control input-" placeholder="email" ref={(c) => this._email = c} type="email"/>
            </div>

            <div className="form-group">
              <input className="form-control input-" placeholder="password" ref={(c) => this._password = c} type="password"/>
            </div>

            <button className="btn btn-success btn-" type="submit">
              {auth.isAuthenticating ?
              <span>Login <i className="fa fa-spinner fa-spin"></i></span>
              :
              <span>Login <i className="fa fa-arrow-right"></i></span>
            }
            </button>
            <div className="m-t">{auth.statusText}</div>

            <a href="#" onClick={onClickForgot}>Forgot password?</a>

          </form>

        </div>

      </div>
    )
  }
})

export default connect((state)=>({
  auth: state.auth
}))(Login)
