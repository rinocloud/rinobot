import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import * as authActions from '../actions/auth'
const { shell } = require('electron')

class Navbar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, auth } = this.props

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

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
          <Link to="/installed_packages" className="m-l">
            Packages/Plugins
          </Link>
          <a
            href="http://docs.rinocloud.com/rinobot/"
            className="m-l"
            onClick={openExternal}
          >
            Documentation
          </a>
          <a href="#" className="pull-right" onClick={onClickLogout}>
            {auth.isAuthenticating ?
              <span>Logging out <i className="fa fa-spinner fa-spin"></i></span>
              :
              <span>Logout {auth.username} <i className="fa fa-sign-out"></i></span>
            }
          </a>
          <a
            href={`https://${auth.project}.rinocloud.com/app/`}
            className="pull-right m-r"
            onClick={openExternal}
          >
            My rinocloud <i className="fa fa-external-link"></i>
          </a>
        </div>
      </div>
    )
  }
}

export { Navbar }
