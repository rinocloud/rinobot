import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import * as authActions from '../actions/auth'
import { Nav, NavItem } from 'react-bootstrap'

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
            <h2 className="lead m-t m-l">Rinobot <i className="fa fa-bell"></i> </h2>
          </div>
          <Nav bsStyle="pills">
            <div className="m-t m-r">
              <NavItem>
                <Link to="/">
                {isHome ?
                  <div style={{ 'backgroundColor': '#4e3156' }}>
                    <span className="text-muted m-r" style={{ display: 'inline-block' }}>
                      <i className="m-l fa fa-crosshairs"></i> Watched Folders
                    </span>
                  </div>
                    :
                  <div style={{ 'backgroundColor': '#674172' }}>
                    <span className="text-muted m-r" style={{ display: 'inline-block' }}>
                      <i className="m-l fa fa-crosshairs"></i> Watched Folders
                    </span>
                  </div>
                }
                </Link>
              </NavItem>
              <NavItem>
                <Link className="m-l text-muted" to="/installed_packages">
                {isPlugins ?
                  <div style={{ 'backgroundColor': '#4e3156' }}>
                    <span className="text-muted m-l" style={{ display: 'inline-block' }}>
                      <i className=" fa fa-line-chart"></i> Plugins
                    </span>
                  </div>
                  :
                  <div style={{ 'backgroundColor': '#674172' }}>
                    <span className="text-muted m-l" style={{ display: 'inline-block' }}>
                      <i className=" fa fa-line-chart"></i> Plugins
                    </span>
                  </div>
                }
                </Link>
              </NavItem>
              <a
                href="http://docs.rinocloud.com/rinobot/"
                className="m-l text-muted"
                onClick={openExternal}
              >
                <i className="fa fa-book"></i> Documentation
              </a>
            </div>
          </Nav>
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
