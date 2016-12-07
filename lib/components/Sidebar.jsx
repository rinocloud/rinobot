import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { shell } from 'electron'


export const Sidebar = (props) => {
  const {
    auth,
    rinobotVersion,
    pathname,
    logout
  } = props

  return (
    <div style={{ height: '99%' }}>
      <div className="wrapper">
        <ul className="list-group">
          <li className="list-group-item list-group-item-heading">
            <h6><strong>Rinocloud Desktop</strong></h6>
          </li>

          <Link
            className="list-group-item"
            to="/"
          >
            <i className="fa fa-file-text-o"></i>{'  '}
            <span>My Files</span>
          </Link>

          <Link
            to="/plugins"
            className={
              pathname === '/plugins' ?
                'list-group-item active' :
                'list-group-item'
            }
          >
            <i className="fa fa-bolt"></i>{'  '}
            <span>Install Plugin</span>
          </Link>

          <Link
            to="/settings"
            className={
              pathname === '/settings' ?
                'list-group-item active' :
                'list-group-item'
            }
          >
            <i className="fa fa-cogs"></i>{'  '}
            <span>Settings</span>
          </Link>

          <a
            href="#"
            className="list-group-item m-t"
            onClick={(e) => {
              e.preventDefault()
              shell.openExternal('https://docs.rinocloud.com/rinocloud-desktop/installation.html')
            }}
          >
            <i className="fa fa fa-book"></i>{'  '}
            <span>Documentation</span>
          </a>
          <a
            href="#"
            className="list-group-item"
            onClick={(e) => {
              e.preventDefault()
              shell.openExternal('https://docs.rinocloud.com/rinocloud-desktop/getting_started.html')
            }}
          >
            <i className="fa fa-play-circle"></i>{'  '}
            <span>Getting started</span>
          </a>
          <a
            href="#"
            className="list-group-item"
            onClick={(e) => {
              e.preventDefault()
              logout()
            }}
          >
            <i className="fa fa-external-link fa-small"></i>{'  '}
            <span>Logout {auth.username}</span>
          </a>
        </ul>
      </div>
      <div>
        <ul className="list-group">
          <li className="list-group-item list-group-item-heading text-muted">
            <small>Rinobot v{rinobotVersion}</small>
          </li>
        </ul>
      </div>
    </div>

  )
}


Sidebar.propTypes = {
  auth: PropTypes.object.isRequired,
  rinobotVersion: PropTypes.string,
  pathname: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
}
