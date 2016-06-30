import React from 'react'
import Loader from 'halogen/PulseLoader'
import ansi_up from 'ansi_up'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import * as watcherActions from '../actions/watcher'
const { dialog } = require('electron').remote;


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

    const removeByIndex = (e, index) => {
      e.preventDefault()
      dispatch(watcherActions.stopWatching(index))
    }

    return (
      <div className="">
        <div className="header">
          <p>Rinocloud watcher beta</p>
        </div>

        <div className="main m-t">
          <a href="#" className="btn btn-sm btn-primary" onClick={chooseFolder}>Choose folder</a>
        </div>
      </div>
    );
  }
})

export default connect((state)=>({
  watcher: state.watcher
}))(Watcher);
