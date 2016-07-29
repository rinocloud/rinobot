import React, { PropTypes } from 'react'
import { WatcherDirsList } from './WatcherDirsList'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
const { dialog } = require('electron').remote;


class Watcher extends React.Component {

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
    this.handleToggleLogsClick = this.handleToggleLogsClick.bind(this)
    this.handleSetConfig = this.handleSetConfig.bind(this)
    this.removeDotRino = this.removeDotRino.bind(this)
  }

  chooseFolder(e) {
    const { dispatch } = this.props
    e.preventDefault()
    const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
    if (paths) {
      dispatch(watcherActions.addDir(paths[0]))
    }
  }

  removeDotRino(index) {
    const { dispatch } = this.props
    dispatch(watcherActions.removeDotRino(index))
  }

  handleRemoveDirClick(index) {
    const { dispatch } = this.props
    dispatch(watcherActions.removeDir(index))
  }

  handleToggleStartClick(turnOn, index) {
    const { dispatch } = this.props
    dispatch(watcherActions.readLocalConfig(index))
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
    dispatch(watcherActions.readLocalConfig(index))
    dispatch(watcherActions.toggleConfigOpen(index))
  }

  handleToggleLogsClick(index) {
    const { dispatch } = this.props
    dispatch(watcherActions.toggleLogsOpen(index))
  }

  handleSetConfig(index, config) {
    const { dispatch } = this.props
    dispatch(watcherActions.setConfig(index, config))
  }

  render() {
    const { watcher, plugins, dispatch } = this.props

    const chooseFolder = (e) => {
      e.preventDefault()
      const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
      if (paths) {
        dispatch(watcherActions.addDir(paths[0]))
      }
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="lead">Rinobot</h2>
            <a href="#" className="btn btn-sm btn-primary" onClick={chooseFolder}>
              Choose folder
            </a>
          </div>
          {watcher.dirs.length ? '' :
            <p className="m-t col-sm-6">
              This is where you can choose directories to watch for file changes.
              Just click on 'Choose folder'.
            </p>
          }

        </div>

        <WatcherDirsList
          dirs={watcher.dirs}
          installedPackages={plugins.installedPackages}
          onRemoveDirClick={this.handleRemoveDirClick}
          onStartClick={this.handleToggleStartClick.bind(this, true)}
          onStopClick={this.handleToggleStartClick.bind(this, false)}
          onToggleConfigClick={this.handleToggleConfigClick}
          onToggleLogsClick={this.handleToggleLogsClick}
          removeDotRino={this.removeDotRino}
          onSetConfig={this.handleSetConfig}
        />

        {watcher.error ?
          <div className="alert alert-danger m-t">
            <p>{watcher.error.name}</p>
            <p>{watcher.error.message}</p>
          </div>
        : null}

      </div>


    );
  }
}

export default connect((state) => ({
  watcher: state.watcher,
  plugins: state.plugins,
}))(Watcher)
