  import React from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
const { dialog } = require('electron').remote;
const { shell } = require('electron')

class TaskForm extends React.Component {

  constructor(props) {
    super(props)
    this.handleChangeMatch = this.handleChangeMatch.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)

    this.state = {
      extraArgs: true
    }
  }

  handleChangeMatch(field) {
    const { task, onChange } = this.props //eslint-disable-line
    return function (e) {
      e.preventDefault()
      const state = {
        ...task,
        [field]: e.target.value
      }
      onChange(state)
    }
  }

  handleRemoveClick(e) {
    const { onRemove } = this.props //eslint-disable-line
    e.preventDefault()
    onRemove()
  }

  render() {
    const { task, pop, installedPackages } = this.props //eslint-disable-line
    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }
    const myPopover = (
      <Popover
        id="popover-trigger-hover-focus"
        //title="what Select command means for you?"
      >
        Select command to run
      </Popover>
    )
    const Match = (
      <Popover
        id="popover-trigger-hover-focus"
      >
        Add file to match
      </Popover>
    )
    const Upload = (
      <Popover
        id="popover-trigger-hover-focus"
      >
      Upload to
      </Popover>
    )
    const Copy = (
      <Popover
        id="popover-trigger-hover-focus"
      >
        Copy to
      </Popover>
    )
    const Select = (
      <Popover
        id="popover-trigger-hover-focus"
      >
    Select command to run
      </Popover>
    )

    return (
      <div className="form-group">
        <div className="col-xs-4">
          <small>Select command to run</small>
          {pop ?
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={myPopover}
            >
              <a
                className="fa fa-question-circle-o m-l-sm"
                href="http://docs.rinocloud.com/rinobot/"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>
          : null}
          <select
            type="text"
            value={task.command || ''}
            className="form-control"
            onChange={this.handleChangeMatch('command')}
          >
            <option value="upload">rinocloud upload</option>
            <option value="copy">copy</option>
            <option value="matlab">matlab</option>
            <option value="python">python</option>
            <option value="Rscript">Rscript</option>
            <option value="custom">custom</option>
            {installedPackages.map((packageName) =>
              <option key={packageName} value={packageName} value="packages">
                {packageName}
              </option>
            )}
          </select>

        </div>

        <div className="col-xs-3">
          <small> Add file to match </small>
          {pop ?
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={Match}
            >
              <a
                className="fa fa-question-circle-o m-l-sm"
                href="http://docs.rinocloud.com/rinobot/"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>
          :
            null
          }
          <input
            key={'myMatch${i}'}
            type="text"
            value={task.match || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('match')}
          />
        </div>

        {task.command === 'upload' || task.command === null ?
          <div className="col-xs-4">
            <small>Upload to</small>
          {pop ?
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={Upload}
            >
              <a
                className="fa fa-question-circle-o m-l-sm"
                href="http://docs.rinocloud.com/rinobot/"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>
          : null}
            <input
              placeholder="write your Rinocloud folder"
              type="text"
              value={task.args || ''}
              className="form-control input-sm"
              onChange={this.handleChangeMatch('args')}
            />
          </div>
        : null}

        {task.command === 'copy' ?
          <div className="col-xs-4">
            <small> Destination folder </small>
          {pop ?
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={Copy}
            >
              <a
                className="fa fa-question-circle-o m-l-sm"
                href="http://docs.rinocloud.com/rinobot/"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>
        : null}
            <input
              type="text"
              value={task.args || ''}
              className="form-control input-sm"
              onChange={this.handleChangeMatch('args')}
            />
          </div>
        : null}

      {['python', 'Rscript', 'matlab'].includes(task.command) ?
        <div className="col-xs-4">
          <div>
            <small>Select {task.command} file</small>
        {pop ?
          <OverlayTrigger
            trigger={['hover']}
            placement="bottom"
            overlay={Select}
          >
            <a
              className="fa fa-question-circle-o m-l-sm"
              href="http://docs.rinocloud.com/rinobot/"
              onClick={openExternal}
            >
            </a>
          </OverlayTrigger>
        : null}
          </div>
          <a
            href="#"
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
                const paths = dialog.showOpenDialog({ properties: ['openFile'] }) // eslint-disable-line
              if (paths) {
                console.log(paths[0])
                this.handleChangeMatch('args')(e, paths[0])
              }
            }}
          >Select file</a>

        </div>
        : null}

        {task.command === 'custom' ?
          <div>
            <div className="col-xs-2">
              <small> Insert command to run</small>
              <input
                type="text"
                value={task.command || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('command')}
              />
            </div>
            <div className="col-xs-4">
              <small> Insert command argument</small>
              <input
                type="text"
                value={task.args || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('args')}
              />
            </div>
          </div>
        : null}

        <div className="col-xs-1 pull-right">
          <button
            className="fa fa-trash task-remove-button btn btn-xs btn-danger"
            onClick={this.handleRemoveClick}
          >
            <i className="fa fa-lg-trash"></i>
          </button>
        </div>

        {task.command === 'upload' ?
          <div style={{ marginTop: '5px' }} className="col-xs-12 text-muted">
            {/*This will upload files to your rinocloud project. You can specify a target
            folder in 'Upload to'*/}
            {'  '}<a href="http://docs.rinocloud.com/rinobot/" onClick={openExternal}>
            ('upload' docs)
            </a>
          </div>
        :
        null}

        {task.command === 'copy' ?
          <div style={{ marginTop: '5px' }} className="col-xs-12 text-muted">
            {/*Copies files to the target location. You can also set the location in Metadata*/}
            {'  '}<a href="http://docs.rinocloud.com/rinobot/" onClick={openExternal}>
            ('copy' docs)</a>
          </div>
        :
        null}
        {task.command === 'matlab' ?
          <div className="col-xs-12 text-muted m-t">
            {'  '}<a href="http://docs.rinocloud.com/rinobot/" onClick={openExternal}>
            ('MATLAB' docs)
            </a>
          </div>
        :
        null}

        {task.command === 'python' ?
          <div className="col-xs-12 text-muted m-t">
            {'  '}<a href="http://docs.rinocloud.com/rinobot/" onClick={openExternal}>
            ('Python' docs)
            </a>
          </div>
        : null}

        {task.command === 'Rscript' ?
          <div className="col-xs-12 text-muted m-t">
            {'  '}<a href="http://docs.rinocloud.com/rinobot/" onClick={openExternal}>
            ('Rscript' docs)
            </a>
          </div>
        : null}

        {task.command === 'custom' ?
          <div className="col-xs-12 text-muted m-t">
            {'  '}<a href="http://docs.rinocloud.com/rinobot/" onClick={openExternal}>
            ('Custom' docs)
            </a>
          </div>
        : null}

        {task.command === 'packages' ?
          <div className="col-xs-12 text-muted m-t">
          {'  '}<a href="http://docs.rinocloud.com/rinobot/" onClick={openExternal}>
          ('Packages' docs)
          </a>
          </div>
        : null}
      </div>
    )
  }
}

export { TaskForm }
