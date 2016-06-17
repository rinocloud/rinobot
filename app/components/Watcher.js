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

    const clearToken = (e) => {
      e.preventDefault()
      dispatch(watcherActions.setToken(null))
    }

    const removeByIndex = (e, index) => {
      e.preventDefault()
      dispatch(watcherActions.stopWatching(index))
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
      <div>
        <div className="row">
          <h2>Rinocloud watcher</h2>
        </div>

        <div className="row">
          <form className="form" onSubmit={chooseFolder}>
            <a href="#" className="btn btn-sm btn-primary" onClick={chooseFolder}>Choose folder</a>
            <a href="#" className="m-l btn btn-sm btn-default" onClick={clearLogs}>Clear log</a>

            <Link to="/documentation" className="pull-right btn btn-sm btn-default">Documentation</Link>
            <a className="pull-right btn btn-sm text-muted" href="#" onClick={toggleDevLog}>toggle verbose log</a>
            {watcher.error}
          </form>
        </div>

        <hr/>

        <div className="row">
          {watcher.paths.length > 0 ?
           'Currently watching'
           :
           <div>
            <p>Not watching anything. {'  '}
            <Link to="/documentation">
              Check out the docs to get started.
            </Link></p>
           </div>
          }
          <ul>
            {watcher.paths.map((path, index)=>{
              return <li key={"path_" + index}>
                {path}{'  '}<a onClick={(e) => {removeByIndex(e, index)}} href="#">remove</a>
              </li>
            })}
          </ul>
        </div>

        <hr/>

        <div className="row m-t">
          {watcher.logs.length === 0 ?
            <pre style={{backgroundColor: 'white'}}>
              No activity yet...
            </pre>
            :
            <pre style={{backgroundColor: 'white'}}>
              {watcher.showDevLogs ?
                watcher.dev_logs.map((log, i)=> <span key={i} dangerouslySetInnerHTML={{__html: ansi_up.ansi_to_html(log + '\n')}}></span>)
              :
                watcher.logs.map((log, i)=> <span key={i} dangerouslySetInnerHTML={{__html: ansi_up.ansi_to_html(log + '\n')}}></span>)
              }
            </pre>
          }
        </div>
      </div>
    );
  }
})

export default connect((state)=>({
  watcher: state.watcher
}))(Watcher);
