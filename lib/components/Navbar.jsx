import { DropdownButton, MenuItem } from 'react-bootstrap'
import * as watcherActions from '../actions/watcher'
import * as authActions from '../actions/auth'
const { dialog } = require('electron').remote
import * as uiActions from '../actions/ui'
import React, { PropTypes } from 'react'
const { shell } = require('electron')
import { Link } from 'react-router'
import pt from 'path'


class Navbar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    watcher: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, ui, auth, watcher } = this.props

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
      <div className="rinobot-navbar">
        <div className="col-sm-12">
          {watcher.dirs.length !== 0 &&
            <DropdownButton
              id="drop"
              title={
                `${pt.basename(pt.dirname(watcher.dirs[ui.currentDir].path))}
                /
                ${pt.basename(watcher.dirs[ui.currentDir].path)}`
              }
              bsSize="xsmall"
            >
              {watcher.dirs.map((dir, i) =>
                <MenuItem
                  style={{ fontSize: '0.8em' }}
                  eventKey={`${i}`}
                  key={`dira${i}`}
                  id={`dira${i}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    dispatch(uiActions.setCurrentDir(i))
                  }}
                >
                  {pt.basename(pt.dirname(dir.path))}/
                  {pt.basename(dir.path)}/
                </MenuItem>
              )}
              <MenuItem
                style={{ fontSize: '0.8em' }}
                eventKey={"add"}
                key={'add'}
                id={'add'}
                href="#"
                onClick={chooseFolder}
              >
                Add directory <i className="fa fa-plus"></i>
              </MenuItem>
            </DropdownButton>
          }

          <Link to="/">
            <i className="m-l-sm fa fa-crosshairs"></i> Watched Folders
          </Link>
          <Link to="/installed_packages" className="m-l">
            <i className="m-l-sm fa fa-line-chart"></i> Plugins
          </Link>
          <a
            href="http://docs.rinocloud.com/rinobot/"
            className="m-l"
            onClick={openExternal}
          >
            <i className="m-l-sm fa fa-book"></i> Documentation
          </a>
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
            My rinocloud <i className="m-l-sm fa fa-external-link"></i>
          </a>

        </div>
      </div>
    )
  }
}

export { Navbar }
