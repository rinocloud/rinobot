import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as authActions from '../actions/auth.js'
const { shell } = require('electron')


export class Login extends React.Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  render() {
    const { actions, location, auth } = this.props

    const handleSubmit = (e) => {
      e.preventDefault()

      const next = location.query.next || '/';

      actions.login({
        email: this._email.value,
        password: this._password.value,
        next
      })
    }

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    return (
      <div>
        <div className="header">
          <div className="row">
            <div className="col-sm-12">
              <a href="https://rinocloud.com/accounts/signup/" className="pull-right" onClick={openExternal}>
                Don't have a Rinocloud account? Sign up.
              </a>
            </div>
          </div>
        </div>

        <div className="main config p-l p-r p-t-lg">
          <div className="row m-t-lg">
            <div className="col-sm-6 col-sm-offset-3">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <div className="panel-title">
                    Login to Rinocloud
                  </div>
                </div>
                <div className="panel-body">
                  <div className="row">
                    <div className="col-sm-12">
                      <form className="m-t" onSubmit={handleSubmit}>
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

                        <button className="btn btn-start btn-" type="submit">
                          {auth.isAuthenticating ?
                            <span>Login
                              <i className="fa fa-spinner fa-spin" style={{ color: '#fff' }}></i>
                            </span>
                          :
                            <span>Login
                              <i className="fa fa-arrow-right" style={{ color: '#fff' }}></i>
                            </span>
                          }
                        </button>
                        <div className="m-t">{auth.statusText}</div>
                        <a href="https://rinocloud.com/accounts/password/reset/" onClick={openExternal}>Forgot password?</a>
                      </form>

                      <small>(Nothing leaves your servers without your explicit request)</small>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...authActions,
  }, dispatch)
})


export default connect(mapStateToProps, mapDispatchToProps)(Login)
