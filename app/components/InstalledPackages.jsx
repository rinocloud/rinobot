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
            <h2 className="lead">Packages</h2>

            <p className="m-t">
              <strong>
                How to install a package
              </strong>
            </p>

            <ol className="m-t">
              <li>
                <a
                  href="https://github.com/search?utf8=✓&q=rinobot-&type=Repositories"
                  onClick={openExternal}
                >
                  Browse available packages on Github
                </a>
              </li>
              <li>
                Download an unzip the package into <br />
                <a href="#" onClick={openPackagesDir}>
                  {constants.packagesDir} <i className="fa fa-external-link"></i>
                </a>
              </li>
            </ol>

            <p className="m-t">
              <strong>Documentation/Guides</strong>
            </p>

            <ol className="m-t">
              <li><a href="#" onClick={openExternal}>
                Detailed guide to installing packages
              </a></li>
              <li><a href="#" onClick={openExternal}>
                Using your own programs
              </a></li>
              <li><a href="#" onClick={openExternal}>(Advanced) Creating a package</a></li>
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
