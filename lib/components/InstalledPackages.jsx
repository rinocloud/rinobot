import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import constants from '../constants'
const { shell } = require('electron')

class InstalledPackages extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired,
  }

  render() {
    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const openPackagesDir = (e) => {
      e.preventDefault()
      shell.showItemInFolder(constants.packagesDir)
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="lead">Plugins</h2>

            <a
              className="btn btn-sm btn-default"
              href="https://github.com/search?utf8=✓&q=rinobot-&type=Repositories"
              onClick={openExternal}
            >
              Browse plugins on Github <i className="fa fa-external-link"></i>
            </a>

            <a
              className="m-l-sm btn btn-sm btn-default"
              href="#"
              onClick={openPackagesDir}
            >
              Open my plugins <i className="fa fa-external-link"></i>
            </a>

            <p className="m-t">
              Plugins let you run all sorts of operations on your data.
            </p>

            <p className="m-t">
              <strong>
                How to install a plugin
              </strong>
            </p>

            <ol className="m-t">
              <li>
                <a
                  href="https://github.com/search?utf8=✓&q=rinobot-&type=Repositories"
                  onClick={openExternal}
                >
                  Browse available plugins on Github
                </a>
              </li>
              <li>
                Download an unzip the plugin into <br />
                <a href="#" onClick={openPackagesDir}>
                  {constants.packagesDir} <i className="fa fa-external-link"></i>
                </a>
              </li>
            </ol>

            <p className="m-t">
              <strong>Documentation/Guides</strong>
            </p>

            <ol className="m-t">
              <li>
                <a
                  href="http://docs.rinocloud.com/rinobot/plugins/installing_a_plugin.html"
                  onClick={openExternal}
                >
                  Detailed guide to installing a plugin
                </a>
              </li>
              <li>
                <a
                  href="http://docs.rinocloud.com/rinobot/tasks/running_your_own_programs.html"
                  onClick={openExternal}
                >
                  Using your own programs
                </a>
              </li>
              <li>
                <a
                  href="http://docs.rinocloud.com/rinobot/plugins/creating_a_plugin.html"
                  onClick={openExternal}
                >
                  Creating and sharing a plugin
                </a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  plugins: state.plugins
}))(InstalledPackages)
