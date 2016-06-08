import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
const { dialog } = require('electron').remote;
import {Tab, Tabs} from 'react-bootstrap'

import * as watcherActions from '../actions/watcher'

export const Watcher = React.createClass({
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

    let activityTitle = "Activity"
    if (watcher.busy){
      activityTitle = <span>{"Activity"}
                        <i style={{marginTop: '-3px', marginLeft: '5px', fontSize: '0.8em'}} className='fa fa-spinner fa-spin'></i>
                      </span>
    }

    return (
      <div className="lead">

        <div className="row">
          <h2>Rinocloud watcher</h2>
        </div>

        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
          <Tab eventKey={1} title="Watcher">
            <div className="row m-a m-t">
              <form className="form" onSubmit={onSubmitToken}>
                  {watcher.token ?
                    <div className="form-group">
                      Token set: {watcher.token}
                      <br/>
                      <small><a href="#" onClick={clearToken}>clear</a></small>
                    </div>
                    :
                    <div>
                      <div className="form-group">
                        <input className="form-control" ref={(c) => this._tokenInput = c} type="text"
                        placeholder="Paste your Rinocloud token here"/>
                      </div>
                      <div className="form-group">
                        <input className="btn btn-primary" type="submit" onClick={onSubmitToken} value="Set token"/>
                      </div>
                    </div>
                  }

                {watcher.error}
              </form>
            </div>

            <hr/>

            <div className="row m-a">
              <form className="form" onSubmit={chooseFolder}>
                <div className="form-group">
                  Choose folders to watch
                </div>
                <a href="#" className="btn btn-primary" onClick={chooseFolder}>Choose folder</a>
                {watcher.error}
              </form>
            </div>

            <hr/>

            <div className="row m-a">
              <p className="lead">
                Currently watching:
              </p>
              <ul>
                {watcher.paths.map((path, index)=>{
                  return <li key={"path_" + index}><small>{path}</small></li>
                })}
              </ul>
            </div>

          </Tab>
          <Tab eventKey={2} title={activityTitle}>
          <pre className="m-t" style={{backgroundColor: 'white'}}>
            {watcher.logs.map((log)=> log + '\n')}
          </pre>
          </Tab>
        </Tabs>

      </div>
    );
  }
})

export default connect((state)=>({
  watcher: state.watcher
}))(Watcher);
