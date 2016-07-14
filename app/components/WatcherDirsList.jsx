import React, { PropTypes } from 'react'
import { WatchDir } from './WatchDir'

export class WatcherDirsList extends React.Component {

  static propTypes = {
    dirs: PropTypes.array.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onStopClick: PropTypes.func.isRequired,
    onRemoveDirClick: PropTypes.func.isRequired,
    onToggleConfigClick: PropTypes.func.isRequired,
    onToggleLogsClick: PropTypes.func.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    removeDotRino: PropTypes.func.isRequired,
    installedPackages: PropTypes.array.isRequired
  }

  render() {
    const { dirs, installedPackages } = this.props

    return (
      <div>
        {dirs.map((dir, index) =>
          <WatchDir
            dir={dir}
            key={`WatcherDir_${index}`}
            onStopClick={() => this.props.onStopClick(index)}
            onStartClick={() => this.props.onStartClick(index)}
            onRemoveDirClick={() => this.props.onRemoveDirClick(index)}
            onToggleConfigClick={() => this.props.onToggleConfigClick(index)}
            onToggleLogsClick={() => this.props.onToggleLogsClick(index)}
            onSetConfig={(config) => this.props.onSetConfig(index, config)}
            removeDotRino={(config) => this.props.removeDotRino(index)}
            installedPackages={installedPackages}
          />
      )}
      </div>)
  }
}
