import * as watcherActions from '../actions/watcher'
import * as authActions from '../actions/auth'
const { dialog } = require('electron').remote
import * as uiActions from '../actions/ui'
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { shell } from 'electron'
import pt from 'path'


class Sidebar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    watcher: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, auth, ui, location, watcher } = this.props

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const onClickLogout = (e) => {
      e.preventDefault()
      dispatch(authActions.logout())
    }

    const chooseFolder = (e) => {
      e.preventDefault()
      const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
      if (paths) {
        dispatch(watcherActions.addDir(paths[0]))
      }
    }

    return (
      <div style={{ height: '100%' }}>
        <div className="wrapper">
          <ul className="list-group">

            <li className="list-group-item list-group-item-heading">
              <strong>Your Folders</strong>
            </li>

            {watcher.dirs.map((dir, i) =>
              <Link
                key={`dira${i}`}
                className={
                  location.pathname === '/' && ui.currentDir === i ?
                    'list-group-item active' :
                    'list-group-item'
                }
                style={{
                  paddingLeft: '35px'
                }}
                to="/"
                onClick={() => {
                  dispatch(uiActions.setCurrentDir(i))
                }}
              >
                <i className="fa fa-level-up fa-rotate-90"></i>{'  '}
                <span>{pt.basename(dir.path)}/</span>
              </Link>
            )}


            <Link
              className="list-group-item"
              to="/"
              onClick={chooseFolder}
            >
              <i className="fa fa-plus"></i>{'  '}
              <span>Add folder</span>
            </Link>

            <li className="list-group-item list-group-item-heading m-t">
              <strong>Automations</strong>
            </li>

            <Link
              to="/plugins"
              className={
                location.pathname === '/plugins' ?
                  'list-group-item active' :
                  'list-group-item'
              }
            >
              <i className="fa fa-area-chart fa"></i>{'  '}
              <span>Install</span>
            </Link>

            <Link
              to="/make"
              className={
                location.pathname === '/make' ?
                  'list-group-item active' :
                  'list-group-item'
              }
            >
              <i className="fa fa-magic fa"></i>{'  '}
              <span>Create</span>
            </Link>

            <li className="list-group-item list-group-item-heading m-t">
              <strong>User</strong>
            </li>

            {auth.isAuthenticating &&
              <a
                href="#"
                onClick={onClickLogout}
                className="list-group-item"
              >
                <i className="fa fa-spinner fa-spin"></i>{'  '}
                <span>Logging out</span>
              </a>
            }

            {!auth.isAuthenticating &&
              <a
                href="#"
                onClick={onClickLogout}
                className="list-group-item"
              >
                <i className="fa fa-sign-out"></i>{'  '}
                <span>Logout {auth.username}</span>
              </a>
            }

            <a
              className="list-group-item"
              href={`https://${auth.project}.rinocloud.com/app/`}
              onClick={openExternal}
            >
              <i className="fa fa-external-link fa-small"></i>{'  '}
              <span>Go to rinocloud</span>
            </a>

            <a
              href="#"
              className="list-group-item"
              onClick={(e) => {
                e.preventDefault()
                shell.openExternal('http://docs.rinocloud.com/rinobot/')
              }
              }
            >
              <i className="fa fa-external-link fa-small"></i>{'  '}
              <span>Documentation</span>
            </a>
          </ul>
        </div>
        <div>
          <ul className="list-group">
            <li className="list-group-item list-group-item-heading m-t text-muted">
              <small>Rinobot v{ui.rinobotVersion}</small>
            </li>
          </ul>
        </div>

      </div>

    )
  }
}

export { Sidebar }
