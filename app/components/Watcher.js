import React, { PropTypes } from 'react'
import { WatcherDirsList } from './WatcherDirsList'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
const { dialog } = require('electron').remote;


export class Watcher extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    watcher: PropTypes.object.isRequired,
    plugins: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.chooseFolder = this.chooseFolder.bind(this)
    this.handleRemoveDirClick = this.handleRemoveDirClick.bind(this)
    this.handleToggleStartClick = this.handleToggleStartClick.bind(this)
    this.handleToggleConfigClick = this.handleToggleConfigClick.bind(this)
    this.handleSetConfig = this.handleSetConfig.bind(this)
  }

  chooseFolder(e) {
    const { dispatch } = this.props
    e.preventDefault()
    const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
    if (paths) {
      dispatch(watcherActions.addDir(paths[0]))
    }
  }

  handleRemoveDirClick(index) {
    const { dispatch } = this.props
    dispatch(watcherActions.removeDir(index))
  }

  handleToggleStartClick(turnOn, index) {
    const { dispatch } = this.props
    if (turnOn === true) {
      dispatch(watcherActions.startDir(index))
    } else {
      dispatch(watcherActions.stopDir(index))
    }
  }

  handleToggleConfigClick(index) {
    const { dispatch, watcher } = this.props

    if (watcher.dirs[index].configOpen) {
      // then its closing and we should persist the configOpen
      dispatch(watcherActions.persistConfig(index))
    }

    dispatch(watcherActions.toggleConfigOpen(index))
  }

  handleSetConfig(index, config) {
    const { dispatch } = this.props
    dispatch(watcherActions.setConfig(index, config))
  }

  render() {
    const { watcher, plugins } = this.props

    return (
      <div className="container">
        <div className="row m-t">
          <div className="col-sm-12">
            <a href="#" className="btn btn-sm btn-primary" onClick={this.chooseFolder}>
              Choose folder
            </a>
          </div>
        </div>

        <WatcherDirsList
          dirs={watcher.dirs}
          installedPackages={plugins.installedPackages}
          onRemoveDirClick={this.handleRemoveDirClick}
          onStartClick={this.handleToggleStartClick.bind(this, true)}
          onStopClick={this.handleToggleStartClick.bind(this, false)}
          onToggleConfigClick={this.handleToggleConfigClick}
          onSetConfig={this.handleSetConfig}
        />
      </div>
    );
  }
}

export default connect((state) => ({
  watcher: state.watcher,
  plugins: state.plugins,
}))(Watcher)
