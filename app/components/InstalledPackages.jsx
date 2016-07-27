import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import constants from '../constants'
const { shell } = require('electron')

export class InstalledPackages extends React.Component {

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
        <div className="row m-t">
          <div className="col-sm-12">
            <p className="lead">Packages</p>
            <a href="" onClick={openExternal}>Getting started with packages</a>
            <br />
            <br />
            <a href="#" className="btn btn-sm btn-default" onClick={openPackagesDir}>
              Open Packages Folder
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  plugins: state.plugins
}))(InstalledPackages)
