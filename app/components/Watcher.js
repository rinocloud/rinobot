import React from 'react'
import Loader from 'halogen/PulseLoader'
import ansi_up from 'ansi_up'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
const { dialog } = require('electron').remote;
const {shell} = require('electron');


export const Watcher = React.createClass({

  componentDidMount(){
    const { watcher, dispatch } = this.props

    this.interval = setInterval(()=>{
      dispatch(watcherActions.syncPathsWithChokidar())
    }, 1000)
  },

  componentWillUnmount(){
    clearInterval(this.interval)
  },

  render() {
    const { watcher, dispatch } = this.props

    const onSubmitToken = (e) => {
      e.preventDefault()
      const token = this._tokenInput.value
      dispatch(watcherActions.setToken(token))
    }

    const chooseFolder = (e) => {
      e.preventDefault()
      const paths = dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']})
      if (paths){
        dispatch(watcherActions.startWatching(paths))
      }
    }

    const clearToken = (e) => {
      e.preventDefault()
      dispatch(watcherActions.setToken(null))
    }

    const removeByIndex = (e, index) => {
      e.preventDefault()
      dispatch(watcherActions.stopWatching(index))
    }

    const openFolder = (e, path) => {
      e.preventDefault()
      shell.showItemInFolder(path)
    }

    const clearLogs = (e, index) => {
      e.preventDefault()
      dispatch(watcherActions.clearLogs())
    }

    const toggleDevLog = (e) => {
      e.preventDefault()
      dispatch(watcherActions.toggleDevLog())
    }

    return (
      <div className="container m-t">
        <div className="row">
          <a href="#" className="btn btn-sm btn-primary" onClick={chooseFolder}>Choose folder</a>
        </div>

        {watcher.paths.map((path, index)=>{
          return (
            <div className="m-t" key={"path_" + index}>
              <div className="row">
                <a href="#" onClick={(e) => {openFolder(e, path)}}>{path}</a>
              </div>
              <div className="row">
                <a className="btn btn-xs btn-default" onClick={(e) => {removeByIndex(e, index)}} href="#">remove</a>{'   '}

              </div>
            </div>
          )
        })}

        <div className="row m-t">
          Latest action: <span dangerouslySetInnerHTML={{__html: ansi_up.ansi_to_html(watcher.lastLog)}}></span>
        </div>
      </div>
    );
  }
})

export default connect((state)=>({
  watcher: state.watcher
}))(Watcher);
