import React, { PropTypes } from 'react'
import { ConfigureTasks } from './ConfigureTasks'


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

    return (
      <div className="m-t row">
        <div className="row">
          {dir.path}
        </div>
        <div className="row">
          {dir.isStarted ?
            <a
              href="#"
              className="btn btn-xs btn-danger"
              onClick={onStopClick}
            >
              stop
            </a>
             :
            <a
              href="#"
              className="btn btn-xs btn-success"
              onClick={onStartClick}
            >
              start
            </a>
          }

          <a
            href="#"
            className="m-l btn btn-xs btn-default"
            onClick={onRemoveDirClick}
          >
            remove
          </a>
          <a
            href="#"
            className="m-l btn btn-xs btn-default"
            onClick={onToggleConfigClick}
          >
            setup
            {dir.configOpen ?
              <i className="fa fa-chevron-down"></i> :
              <i className="fa fa-chevron-right"></i>}

          </a>
        </div>

        {dir.configOpen ?
          <ConfigureTasks
            dir={dir}
            onSetConfig={this.props.onSetConfig}
            installedPackages={installedPackages}
          />
         : ''}

        <hr />
      </div>

    )
  }
}
