import { Dropdown, MenuItem } from 'react-bootstrap'
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
    location: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, ui, auth, watcher, location } = this.props

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

    const currentLocation = this.props.location.pathname
    const isHome = currentLocation === '/'
    const isPlugins = currentLocation === '/installed_packages'

    return (
      <ul className="nav nav-siderbar m-t">
        <div className="m-t" >

          {watcher.dirs.length !== 0 &&
            <li>
              <Dropdown
                id="dropdown-custom-1"
                className="m-l m-b"
              >
                <Dropdown.Toggle
                  id="drop"

                  title={
                    `${pt.basename(pt.dirname(watcher.dirs[ui.currentDir].path))}
                    /
                    ${pt.basename(watcher.dirs[ui.currentDir].path)}`
                  }
                  bsSize="small"
                >
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {watcher.dirs.map((dir, i) =>
                    <MenuItem
                      style={{ fontSize: '1em' }}
                      eventKey={`${i}`}
                      className=""
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
                    style={{ fontSize: '1em', borderTop: '1px solid #f7f7f7' }}
                    eventKey={"add"}
                    key={'add'}
                    id={'add'}
                    href="#"
                    onClick={chooseFolder}
                  >
                    Add directory <i className="fa fa-plus"></i>
                  </MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            </li>
          }

          <li>
            <Link to="/">
            {isHome ?
              <div className="background-rino1">
                <span className="text-rino" style={{ display: 'inline-block' }}>
                  <i className="m-l fa fa-crosshairs"></i> Watched Folders
                </span> {'  '}
              </div>
                :
              <div className="background-rinono1">
                <span className="text-rino" style={{ display: 'inline-block' }}>
                  <i className="m-l fa fa-crosshairs"></i> Watched Folders
                </span>
              </div>
            }
            </Link>
          </li>
          <li>
            <Link className="m-l text-rino" to="/installed_packages">
            {isPlugins ?
              <div className="background-rino">
                <span className="text-rino m-l" style={{ display: 'inline-block' }}>
                  <i className=" fa fa-line-chart fa"></i> Plugins
                </span>
              </div>
              :
              <div className="background-rinono">
                <span className="text-rino m-l" style={{ display: 'inline-block' }}>
                  <i className=" fa fa-line-chart fa"></i> Plugins
                </span>
              </div>
            }
            </Link>
          </li>
          <li>
            <a
              href="http://docs.rinocloud.com/rinobot/"
              className="m-l text-rino"
              onClick={openExternal}
            >
              <i className="fa fa-book fa-lg"></i> Documentation
            </a>
          </li>
        </div>
      </ul>
    )
  }
}

export { Navbar }


/*
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
*/
