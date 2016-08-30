import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import * as authActions from '../actions/auth'
import { Nav, NavItem } from 'react-bootstrap'
import { Footer } from './Footer'
const { shell } = require('electron')

class Navbar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    // eventKey: PropTypes.number,
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

    // const handleSelect = (e) => {
    //   e.preventDefault()
    //   this.setState({ eventKey: !this.state.eventKey })
    // }


    return (
      <div>
        <div className="sidebar">
          <div className="m-t">
            <h2 className="lead m-t m-l">Rinobot</h2>
          </div>
          <Nav
            bsStyle="pills"
            //  stacked activeKey={1}
            //  onSelect={(e) => {
            //    e.preventDefault()
            //    handleSelect(e)
            //  }}
          >
            <div className="m-t">
              <NavItem eventKey={1} href="/home">
                <Link to="/">
                  <i className="m-l fa fa-crosshairs"></i> Watched Folders
                </Link>
              </NavItem>
              <div className="m-t">
                <NavItem eventKey={2} title="Item">
                  <Link to="/installed_packages" className="m-l">
                    <i className=" fa fa-line-chart"></i> Plugins
                  </Link>
                </NavItem>
              </div>
              <div className="m-t"></div>
              <NavItem eventKey={3} title="Item">
                <a
                  href="http://docs.rinocloud.com/rinobot/"
                  className="m-l"
                  onClick={openExternal}
                >
                  <i className="fa fa-book"></i> Documentation
                </a>
              </NavItem>
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
