import React, { PropTypes } from 'react'
import { ConfigurePipeline } from './ConfigurePipeline'
const { shell } = require('electron')


export class WatchDir extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onStopClick: PropTypes.func.isRequired,
    onRemoveDirClick: PropTypes.func.isRequired,
    onToggleConfigClick: PropTypes.func.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    installedPackages: PropTypes.array.isRequired
  }

  render() {
    const { dir, installedPackages } = this.props

    const onStartClick = (e) => {
      e.preventDefault()
      this.props.onStartClick()
    }

    const onStopClick = (e) => {
      e.preventDefault()
      this.props.onStopClick()
    }

    const onRemoveDirClick = (e) => {
      e.preventDefault()
      this.props.onRemoveDirClick()
    }

    const onToggleConfigClick = (e) => {
      e.preventDefault()
      this.props.onToggleConfigClick()
    }

    const openPluginHomepage = (e) => {
      e.preventDefault()
      shell.showItemInFolder(dir.path)
    }

    return (
      <div className="p-a bordered m-t">
        <div className="row">
          <div className="col-sm-12 lead">
            <a href="#" onClick={openPluginHomepage}>{dir.path}</a>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            {dir.isStarted ?
              <a
                href="#"
                className="btn btn-sm btn-danger"
                onClick={onStopClick}
              >
                stop
              </a>
               :
              <a
                href="#"
                className="btn btn-sm btn-success"
                onClick={onStartClick}
              >
                start
              </a>
            }

            <a
              href="#"
              className="m-l btn btn-sm btn-default"
              onClick={onRemoveDirClick}
            >
              remove
            </a>
            <a
              href="#"
              className="m-l btn btn-sm btn-default"
              onClick={onToggleConfigClick}
            >
            {dir.configOpen ?
              'save settings' :
              'setup'
              }

            </a>
          </div>
        </div>

        {dir.configOpen ?
          <ConfigurePipeline
            dir={dir}
            onSetConfig={this.props.onSetConfig}
            installedPackages={installedPackages}
          />
         : ''}
      </div>

    )
  }
}
