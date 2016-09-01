import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import * as authActions from '../actions/auth'
import * as uiActions from '../actions/ui'
import pt from 'path'
const { shell } = require('electron')

class Navbar extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    watcher: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
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

    return (
      <div className="row m-b-0 p-t">
        <div className="col-sm-12">
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

          {watcher.dirs.map((dir, i) => {
            return (
              <a
                href="#"
                key={`dira${i}`}
                onClick={(e) => {
                  e.preventDefault()
                  dispatch(uiActions.setCurrentDir(i))
                }}
              >
                <br />
                {pt.basename(dir.path)}

              </a>
            )
          })}

        </div>
      </div>
    )
  }
}

export { Navbar }
