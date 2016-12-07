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
        <div className="main config loginPossition">
          <div className="row">
            <div className="panel panel-primary">
              <div className="panel-body">
                <div className="text-xs-center">
                  <img src="../login.png" className="img-circle loginPicture" alt="..." />
                  {/* <div>Log in to Rinocloud </div> */}
                </div>
                <div className="col-sm-8 col-sm-offset-2">
                  <div style={{ color: '#b13704' }}>
                    <small>{auth.statusText}</small>
                  </div>
                  <form className="m-t" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <input
                        style={{ height: '40px' }}
                        className="form-control"
                        placeholder="email"
                        ref={(c) => { this._email = c }}
                        type="email"
                      />
                    </div>

                    <div className="form-group">
                      <input
                        style={{ height: '40px' }}
                        className="form-control"
                        placeholder="password"
                        ref={(c) => { this._password = c }}
                        type="password"
                      />
                    </div>
                    <button
                      className="btn col-sm-12 btn-add-folder"
                      style={{
                        height: '40px',
                        // backgroundColor: '#647997',
                        // color: 'white',
                        // fontSize: '1em',
                        backgroundColor: '#5bc0de',
                        color: '#ffffff',
                        borderColor: '#46b8da',
                      }}
                      type="submit"
                    >
                      {auth.isAuthenticating ?
                        <span>Log in {''}
                          <i className="fa fa-spinner fa-spin"></i>
                        </span>
                      :
                        <span>Log in {'  '}
                          <i className="fa fa-arrow-right"></i>
                        </span>
                      }
                    </button>
                  </form>
                  <div className="col-sm-12">
                    <a
                      className="pull-right m-t"
                      href="https://rinocloud.com/accounts/password/reset/"
                      style={{ color: '#31708f' }}
                      onClick={openExternal}
                    >
                      Forgot password?
                    </a>
                    <div className="col-sm-8 m-t">
                      <small style={{ color: '#9f9f9f' }}>
                        (No Files get upload unless you want)
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <a
              className="m-t"
              style={{ marginLeft: '300px', color: '#31708f' }}
              href="https://rinocloud.com/accounts/signup/"
              onClick={openExternal}
            >
              <i className="fa fa-external-link" /> {' '}
               Dont have Rinocloud account
            </a>
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
