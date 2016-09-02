import React, { PropTypes } from 'react'
import { WatchDir } from './WatchDir'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
const { dialog } = require('electron').remote
const { shell } = require('electron')


class Watcher extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    watcher: PropTypes.object.isRequired,
    plugins: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.chooseFolder = this.chooseFolder.bind(this)
    this.handleRemoveDirClick = this.handleRemoveDirClick.bind(this)
    this.handleToggleStartClick = this.handleToggleStartClick.bind(this)
    this.handleToggleConfigClick = this.handleToggleConfigClick.bind(this)
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
    console.log('handleToggleConfigClick')
    const { dispatch } = this.props
    dispatch(watcherActions.persistConfig(index))
    // dispatch(watcherActions.readLocalConfig(index))
  }

  handleSetConfig(index, config) {
    console.log('handleSetConfig')
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

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const dismissError = (e) => {
      e.preventDefault()
      dispatch(watcherActions.dismissError())
    }

    return (
      <div className="row p-a">
        <div className="col-sm-12">
          {watcher.dirs.length ? '' :
            <p className="m-t col-sm-12">

              Select a folder to monitor or read the {'  '}
              <a
                href="http://docs.rinocloud.com/rinobot/introduction/getting_started.html"
                onClick={openExternal}
              >
                Getting Started Guide
              </a>.
            </p>
          }

        </div>

        {watcher.dirs.length !== 0 &&
          <WatchDir
            dir={watcher.dirs[ui.currentDir]}
            key={`WatcherDir_${ui.currentDir}`}
            onStopClick={() => this.handleToggleStartClick(false, ui.currentDir)}
            onStartClick={() => this.handleToggleStartClick(true, ui.currentDir)}
            onRemoveDirClick={() => this.handleRemoveDirClick(ui.currentDir)}
            onToggleConfigClick={() => this.handleToggleConfigClick(ui.currentDir)}
            onSetConfig={(config) => this.handleSetConfig(ui.currentDir, config)}
            removeDotRino={() => this.removeDotRino(ui.currentDir)}
            packagesConfig={plugins.config}
          />
        }

        {watcher.dirs.length === 0 &&
          <div className="block">
            <div className="text-center">
              <h3>Choose a folder to get started</h3>
              <a
                href="#"
                className="btn btn-lg btn-primary m-t"
                onClick={chooseFolder}
              >
                Add folder <i className="fa fa-plus"></i>
              </a>
            </div>
          </div>
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
