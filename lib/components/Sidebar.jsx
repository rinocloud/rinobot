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
      <div style={{ height: '99%' }}>
        <div className="wrapper">
          <ul className="list-group">
            <li className="list-group-item list-group-item-heading">
              <h6><strong>Rinobot</strong></h6>
            </li>
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
              <h6><strong>Plugins</strong></h6>
            </li>

            <Link
              to="/plugins"
              className={
                pathname === '/plugins' ?
                  'list-group-item active' :
                  'list-group-item'
              }
            >
              <i className="fa fa-bolt"></i>{'  '}
              <span>Install</span>
            </Link>
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
}

export { Sidebar }
