import React, { PropTypes } from 'react'
import { WatchDir } from './WatchDir'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
const { dialog } = require('electron').remote


class Watcher extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    watcher: PropTypes.object.isRequired,
    plugins: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleRemoveDirClick = this.handleRemoveDirClick.bind(this)
    this.handleToggleStartClick = this.handleToggleStartClick.bind(this)
    this.handleToggleConfigClick = this.handleToggleConfigClick.bind(this)
    this.handleSetConfig = this.handleSetConfig.bind(this)
    this.removeDotRino = this.removeDotRino.bind(this)
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
    const { dispatch } = this.props
    dispatch(watcherActions.persistConfig(index))
  }

  handleSetConfig(index, config) {
    const { dispatch } = this.props
    dispatch(watcherActions.setConfig(index, config))
  }

  render() {
    const { watcher, plugins, ui, dispatch } = this.props

    const chooseFolder = (e) => {
      e.preventDefault()
      const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
      if (paths) {
        dispatch(watcherActions.addDir(paths[0]))
      }
    }

    const dismissError = (e) => {
      e.preventDefault()
      dispatch(watcherActions.dismissError())
    }

    return (
      <div>
        {watcher.dirs.length === 0 &&
          <div className="block light-grey-background">
            <div className="text-center">
              <h2 className="block-title">Choose a folder to get started</h2>
              <a
                href="#"
                className="btn btn btn-primary m-t"
                onClick={chooseFolder}
              >
                Add folder <i className="fa fa-plus"></i>
              </a>
            </div>
          </div>
        }

        {watcher.dirs.length > 0 &&
          <WatchDir
            dir={watcher.dirs[ui.currentDir]}
            key={`WatcherDir_${ui.currentDir}`}
            isStarting={ui.watcherIsStarting}
            onStopClick={() => this.handleToggleStartClick(false, ui.currentDir)}
            onStartClick={() => this.handleToggleStartClick(true, ui.currentDir)}
            onRemoveDirClick={() => this.handleRemoveDirClick(ui.currentDir)}
            onToggleConfigClick={() => this.handleToggleConfigClick(ui.currentDir)}
            onSetConfig={(config) => this.handleSetConfig(ui.currentDir, config)}
            removeDotRino={() => this.removeDotRino(ui.currentDir)}
            packagesConfig={plugins.config}
          />
        }

        {watcher.error ?
          <pre
            className="alert alert-danger m-t"
            style={{ fontSize: '11px' }}
          >
            <a
              href="#"
              className="pull-right"
              onClick={dismissError}
            >
              (dismiss)
            </a>
            {JSON.stringify(watcher.error, null, 2)}
          </pre>
        : null}

      </div>
    )
  }
}

export default connect((state) => ({
  watcher: state.watcher,
  plugins: state.plugins,
  ui: state.ui
}))(Watcher)
