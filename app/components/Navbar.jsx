import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import * as authActions from '../actions/auth'

class Navbar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, auth } = this.props

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

export { Navbar }
