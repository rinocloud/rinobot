import * as watcherActions from '../actions/watcher'
import * as authActions from '../actions/auth'
const { dialog } = require('electron').remote
import * as uiActions from '../actions/ui'
import React, { PropTypes } from 'react'
const { shell } = require('electron')
import { Link } from 'react-router'
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
          <strong>Automate</strong>
        </li>


        <Link
          to="/installed_packages"
          className={
            location.pathname === '/installed_packages' ?
              'list-group-item active' :
              'list-group-item'
          }
        >
          <i className="fa fa-line-chart fa"></i>{'  '}
          <span>Plugins</span>
        </Link>


        <a
          href="#"
          className="list-group-item"
          onClick={(e) => {
            e.preventDefault()
            shell.openExternal('http://docs.rinocloud.com/rinobot/')
          }
          }
        >
          <i className="fa fa-book fa-lg"></i>{'  '}
          <span>Documentation</span>
        </a>

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
          <i className="fa fa-external-link"></i>{'  '}
          <span>Go to rinocloud</span>
        </a>

        <li className="list-group-item list-group-item-heading m-t text-muted">
          <small>Rinobot v{ui.rinobotVersion}</small>
        </li>

      </ul>
    )
  }
}

export { Sidebar }
