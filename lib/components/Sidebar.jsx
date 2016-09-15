const { dialog } = require('electron').remote
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { shell } from 'electron'
import pt from 'path'


class Sidebar extends React.Component {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    watcher: PropTypes.array.isRequired,
    currentDir: PropTypes.number.isRequired,
    rinobotVersion: PropTypes.string,
    pathname: PropTypes.string.isRequired,
    logout: PropTypes.func.isRequired,
    addDir: PropTypes.func.isRequired,
    setCurrentDir: PropTypes.func.isRequired,
  }

  render() {
    const {
      auth,
      currentDir,
      rinobotVersion,
      pathname,
      watcher
    } = this.props

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const onClickLogout = (e) => {
      e.preventDefault()
      this.props.logout()
    }

    const setCurrentDir = (index) => {
      this.props.setCurrentDir(index)
    }

    const chooseFolder = (e) => {
      e.preventDefault()
      const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
      if (paths) {
        this.props.addDir(paths[0])
      }
    }

    return (
      <div style={{ height: '100%' }}>
        <div className="wrapper">
          <ul className="list-group">

            <li className="list-group-item list-group-item-heading">
              <h6><strong>My Folders</strong></h6>
            </li>

            {watcher.map((dir, i) =>
              <Link
                key={`dira${i}`}
                className={
                  pathname === '/' && currentDir === i ?
                    'list-group-item active' :
                    'list-group-item'
                }
                style={{
                  paddingLeft: '35px'
                }}
                to="/"
                onClick={() => setCurrentDir(i)}
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
              <h6><strong>Automations</strong></h6>
            </li>

            <Link
              to="/plugins"
              className={
                pathname === '/plugins' ?
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
                pathname === '/make' ?
                  'list-group-item active' :
                  'list-group-item'
              }
            >
              <i className="fa fa-magic fa"></i>{'  '}
              <span>Create</span>
            </Link>

            <li className="list-group-item list-group-item-heading m-t">
              <h6><strong>User</strong></h6>
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
              <small>Rinobot v{rinobotVersion}</small>
            </li>
          </ul>
        </div>

      </div>

    )
  }
}

export { Sidebar }
