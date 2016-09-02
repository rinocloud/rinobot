import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import * as authActions from '../actions/auth'

const { shell } = require('electron')

class Navbar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, auth, } = this.props

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const onClickLogout = (e) => {
      e.preventDefault()
      dispatch(authActions.logout())
    }

    const currentLocation = this.props.location.hash
    const isHome = currentLocation.includes('#/?')
    const isPlugins = currentLocation.includes('installed_packages')

    console.log(location)

    return (
      <div>
        <div className="sidebar">
          <div className="m-t">
            <h2 className="lead m-t m-l">Rinobot </h2>
          </div>
          <ul className="nav nav-siderbar m-t">
            <div className="m-t">
              <il>
                <Link to="/">
                {isHome ?
                  <div className="background-rino1">
                    <span className="text-rino" style={{ display: 'inline-block' }}>
                      <i className="m-l fa fa-crosshairs fa-lg"></i> Watched Folders
                    </span>
                  </div>
                    :
                  <div className="background-rinono1">
                    <span className="text-rino" style={{ display: 'inline-block' }}>
                      <i className="m-l fa fa-crosshairs fa-lg"></i> Watched Folders
                    </span>
                  </div>
                }
                </Link>
              </il>
              <il>
                <Link className="m-l text-rino" to="/installed_packages">
                {isPlugins ?
                  <div className="background-rino">
                    <span className="text-rino m-l" style={{ display: 'inline-block' }}>
                      <i className=" fa fa-line-chart fa-lg"></i> Plugins
                    </span>
                  </div>
                  :
                  <div className="background-rinono">
                    <span className="text-rino m-l" style={{ display: 'inline-block' }}>
                      <i className=" fa fa-line-chart fa-lg"></i> Plugins
                    </span>
                  </div>
                }
                </Link>
              </il>
              <div className="m-t">
                <il>
                  <a
                    href="http://docs.rinocloud.com/rinobot/"
                    className="m-l text-rino"
                    onClick={openExternal}
                  >
                    <i className="fa fa-book fa-lg"></i> Documentation
                  </a>
                </il>
              </div>
            </div>
          </ul>
        </div>
        <div className="col-sm-12">
          <div className="m-r" >
            <a href="#" className="pull-right" onClick={onClickLogout}>
              {auth.isAuthenticating ?
                <span>Logging out <i className="m-l-sm fa fa-spinner fa-spin"></i></span>
                :
                <span>Logout {auth.username} <i className="m-l-sm fa fa-sign-out"></i></span>
              }
            </a>
            <a
              href={`https://${auth.project}.rinocloud.com/app/`}
              className="pull-right m-r"
              onClick={openExternal}
            >
              My rinocloud
              <i className="m-l-sm fa fa-external-link"></i>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export { Navbar }
