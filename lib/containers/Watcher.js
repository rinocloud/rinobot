import React, { PropTypes } from 'react'
import { WatchDir } from '../components/WatchDir'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
const { dialog } = require('electron').remote


class Watcher extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    watcher: PropTypes.array.isRequired,
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

    const saveConfig = (index, config) => {
      dispatch(watcherActions.setConfig(index, config))
      dispatch(watcherActions.unsetConfigDirty(index))
      dispatch(watcherActions.persistConfig(index))
    }

    return (
      <div>

        {watcher.length === 0 &&
          <div>
            <div className="panel panel-default">
              <div className="panel-heading text-center"  style={{ height: '500px'}}>
                <h2 className="block-title m-t-lg" style={{height:'20%'}}>Choose a folder to get started</h2>
                <a
                  href="#"
                  className="btn btn btn-primary m-t"
                  onClick={chooseFolder}
                >
                  Add folder <i className="fa fa-plus"></i>
                </a>
              </div>
            </div>
            <div className="panel-body config text-center">
            </div>
          </div>

        }

        {watcher.length > 0 &&
          <WatchDir
            dir={watcher[ui.currentDir]}
            key={`WatcherDir_${ui.currentDir}`}
            isStarting={ui.watcherIsStarting}
            onStopClick={() => toggleWatching(false, ui.currentDir)}
            onStartClick={() => toggleWatching(true, ui.currentDir)}
            onRemoveDirClick={() => removeDir(ui.currentDir)}
            onSaveConfig={(config) => saveConfig(ui.currentDir, config)}
            removeDotRino={() => removeDotRino(ui.currentDir)}
            packagesConfig={plugins.config}
            registry={plugins.registry}
          />
        }

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  watcher: state.watcher,
  plugins: state.plugins,
  ui: state.ui
})


export default connect(mapStateToProps)(Watcher)
