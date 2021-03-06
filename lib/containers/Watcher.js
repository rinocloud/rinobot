import React, { PropTypes } from 'react'
import { WatchDir } from '../components/WatchDir'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
import * as authActions from '../actions/auth'
const { dialog } = require('electron').remote


class Watcher extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    watcher: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    plugins: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
  }

  render() {
    const { watcher, auth, plugins, form, ui, dispatch } = this.props

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
          <div className="m-t-lg p-t-lg">
            <div className="text-center" style={{ height: '500px' }}>
              <h2 className="block-title m-t-lg" style={{ height: '20%' }}>
                Rinobot is here to <i className="fa fa-bolt" />supercharge your data!
              </h2>
              <a
                href="#"
                className="btn btn-add-folder m-t-sm"
                onClick={chooseFolder}
              >
                <i className="fa fa-plus"></i>
                <span>Add a folder to get started</span>
              </a>
            </div>
          </div>
        }

        {watcher.length > 0 &&
          <WatchDir
            key={`WatcherDir_${ui.currentDir}`}
            dir={watcher[ui.currentDir]}
            form={form}
            auth={auth}
            dispatch={dispatch}
            logout={() => dispatch(authActions.logout())}
            isStarting={ui.watcherIsStarting}
            installedPlugins={plugins.installed}
            registry={plugins.registry}
            onStopClick={() => toggleWatching(false, ui.currentDir)}
            onStartClick={() => toggleWatching(true, ui.currentDir)}
            onRemoveDirClick={() => removeDir(ui.currentDir)}
            onSaveConfig={(config) => saveConfig(ui.currentDir, config)}
            removeDotRino={() => removeDotRino(ui.currentDir)}
          />
        }

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  watcher: state.watcher,
  plugins: state.plugins,
  auth: state.auth,
  form: state.form,
  ui: state.ui
})


export default connect(mapStateToProps)(Watcher)
