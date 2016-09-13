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

  render() {
    const { watcher, plugins, ui, dispatch } = this.props

    const chooseFolder = (e) => {
      e.preventDefault()
      const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
      if (paths) {
        dispatch(watcherActions.addDir(paths[0]))
      }
    }

    const removeDotRino = (index) => {
      dispatch(watcherActions.removeDotRino(index))
    }

    const removeDir = (index) => {
      dispatch(watcherActions.removeDir(index))
    }

    const toggleWatching = (turnOn, index) => {
      dispatch(watcherActions.readLocalConfig(index))
      if (turnOn === true) {
        dispatch(watcherActions.startDir(index))
      } else {
        dispatch(watcherActions.stopDir(index))
      }
    }

    const saveConfig = (index) => {
      dispatch(watcherActions.unsetConfigDirty(index))
      dispatch(watcherActions.persistConfig(index))
    }

    const changeConfig = (index, config) => {
      dispatch(watcherActions.setConfigDirty(index))
      dispatch(watcherActions.setConfig(index, config))
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
            onStopClick={() => toggleWatching(false, ui.currentDir)}
            onStartClick={() => toggleWatching(true, ui.currentDir)}
            onRemoveDirClick={() => removeDir(ui.currentDir)}
            onSaveConfig={() => saveConfig(ui.currentDir)}
            onSetConfig={(config) => changeConfig(ui.currentDir, config)}
            removeDotRino={() => removeDotRino(ui.currentDir)}
            packagesConfig={plugins.config}
            registry={plugins.pluginRegistry}
          />
        }

      </div>
    )
  }
}

export default connect((state) => ({
  watcher: state.watcher,
  plugins: state.plugins,
  ui: state.ui
}))(Watcher)
