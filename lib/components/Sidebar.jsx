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
    const { dispatch, auth, watcher } = this.props

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
      <ul className="nav nav-siderbar p-a m-t">
        <li><strong>FOLDERS</strong></li>
        <li>
          <Link
            to="/"
            onClick={chooseFolder}
          >
            <i className="fa fa-plus"></i> Add directory
          </Link>
        </li>
        {watcher.dirs.map((dir, i) =>
          <li key={`dira${i}`}>
            <Link
              to="/"
              onClick={() => {
                dispatch(uiActions.setCurrentDir(i))
              }}
            >
            <i className="fa fa-folder-o"></i> {pt.basename(dir.path)}/
            </Link>
          </li>
        )}

        <li><strong>EXTEND</strong></li>

        <li>
          <Link to="/installed_packages">
            <i className="fa fa-line-chart fa"></i> Plugins
          </Link>
        </li>
        <li>
          <a
            href="http://docs.rinocloud.com/rinobot/"
            className="text-rino"
            onClick={openExternal}
          >
            <i className="fa fa-book fa-lg"></i> Documentation
          </a>
        </li>

        <li>
          <a href="#" onClick={onClickLogout}>
            {auth.isAuthenticating ?
              <span>Logging out <i className="fa fa-spinner fa-spin"></i></span>
              :
              <span>Logout {auth.username} <i className="fa fa-sign-out"></i></span>
            }
          </a>
        </li>
        <li>
          <a
            href={`https://${auth.project}.rinocloud.com/app/`}
            className="pull-right m-r"
            onClick={openExternal}
          >
            My rinocloud
            <i className="fa fa-external-link"></i>
          </a>
        </li>



      </ul>
    )
  }
}

export { Sidebar }
