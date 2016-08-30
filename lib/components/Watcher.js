import React, { PropTypes } from 'react'
import { WatcherDirsList } from './WatcherDirsList'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
import * as pluginActions from '../actions/plugins'
const { dialog } = require('electron').remote
const { shell } = require('electron')


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

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const dismissError = (e) => {
      e.preventDefault()
      dispatch(watcherActions.dismissError())
    }

    return (
      <div className="main-container" style={{ 'margin-top':'50px', 'margin-bottom':'60%'}}>
        <div className='col-sm-12'>
          <div className="m-l m-r m-t">
            <a href="#" className="btn btn-sm btn-primary" onClick={chooseFolder}>
              <i className="fa fa-search" /> Select folder
            </a>
          </div>
          {watcher.dirs.length ? '' :
            <p className="m-t col-sm-12 m-l text center">
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

        <WatcherDirsList
          dirs={watcher.dirs}
          packagesConfig={plugins.config}
          onRemoveDirClick={this.handleRemoveDirClick}
          onStartClick={this.handleToggleStartClick.bind(this, true)}
          onStopClick={this.handleToggleStartClick.bind(this, false)}
          onToggleConfigClick={this.handleToggleConfigClick}
          onToggleLogsClick={this.handleToggleLogsClick}
          removeDotRino={this.removeDotRino}
          onSetConfig={this.handleSetConfig}
        />

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
}))(Watcher)
