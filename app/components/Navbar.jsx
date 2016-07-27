import React, { PropTypes } from 'react'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as watcherActions from '../actions/watcher'
import * as authActions from '../actions/auth'
const { dialog } = require('electron').remote

export class Navbar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    watcher: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    plugins: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, auth, location } = this.props

    const onClickLogout = (e) => {
      e.preventDefault()
      dispatch(authActions.logout())
    }

    return (
      <div className="row m-l m-r m-t m-b-0 p-t">
        <div className="col-sm-12">
          <Link to="/">
            Watched Folders
          </Link>

          <a href="#" className="pull-right" onClick={onClickLogout}>
            {auth.isAuthenticating ?
              <span>Logging out <i className="fa fa-spinner fa-spin"></i></span>
              :
              <span>Logout {auth.username} <i className="fa fa-sign-out"></i></span>
            }
          </a>
          <Link to="/installed_packages" className="m-l">
            My packages
          </Link>
        </div>
      </div>
    )
  }
}

export default connect((state) => ({
  watcher: state.watcher,
  plugins: state.plugins,
  auth: state.auth
}))(Navbar)
