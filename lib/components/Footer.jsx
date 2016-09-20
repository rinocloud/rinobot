import React, { PropTypes } from 'react'
const { shell } = require('electron')

class Footer extends React.Component {

  static propTypes = {
    ui: PropTypes.object.isRequired,
  }

  render() {
    const { ui } = this.props

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    let pythonMajorVersion = null
    if (ui.pythonVersion) {
      pythonMajorVersion = ui.pythonVersion.split('.')[0]
    }

    const pythonLink = (
      <a
        href="https://www.continuum.io/downloads#_windows"
        onClick={openExternal}
        className="text-muted"
        style={{
          textDecoration: 'underline'
        }}
      >
        Python 3
      </a>
    )

    return (
      <div className="footer text-muted">
        <div className="col-sm-10 col-sm-offset-2 m-t p-t-sm">
          {ui.pythonVersion === false ?
            <span>
              {/*No python found, please install {pythonLink} to use plugins.*/}
            </span>
          :
          ''}
          {pythonMajorVersion === '2' ?
            <span>
              {/*Python {ui.pythonVersion} found, please install {pythonLink} to use plugins.*/}
            </span>
          :
          ''}
        </div>

      </div>
    )
  }
}

export { Footer }
