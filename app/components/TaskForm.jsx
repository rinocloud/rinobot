import React from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
const { dialog } = require('electron').remote;

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
    const { task, installedPackages } = this.props //eslint-disable-line

    const myPopover = (
      <Popover id="popover-trigger-hover-focus" title="popover-bottom">
        tengo que resolver un problema
      </Popover>
    )

    return (
      <div className="form-group">

        <div className="col-xs-4">
          <small>Select comand to run</small>
          <OverlayTrigger
            trigger={['hover']}
            placement="bottom"
            overlay={myPopover}
          >
            <i className="fa fa-question-circle-o m-l-sm"></i>
          </OverlayTrigger>

          <select
            type="text"
            value={task.command || ''}
            className="form-control"
            onChange={this.handleChangeMatch('command')}
          >
            <option value="upload">rinocloud upload</option>
            <option value="copy" >copy</option>
            <option value="matlab">matlab</option>
            <option value="python">python</option>
            <option value="Rscript">Rscript</option>
            <option value="custom">custom</option>
            {installedPackages.map((packageName) =>
              <option key={packageName} value={packageName}>
                {packageName}
              </option>
            )}
          </select>

        </div>

        <div className="col-xs-3">
          <small> Add file to match
            <i className="fa fa-question-circle-o m-l-sm"></i>
          </small>
          <input
            type="text"
            value={task.match || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('match')}
          />
        </div>

        {task.command === 'upload' || task.command === null ?
          <div className="col-xs-4">
            <small>Upload to</small>
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
            <small> Destination folder
              <i className="fa fa-question-circle-o m-l-sm"></i>
            </small>
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
            <i className="fa fa-question-circle-o m-l-sm"></i>
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
              <i className="fa fa-question-circle-o m-l-sm"></i>
              <input
                type="text"
                value={task.command || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('command')}
              />
            </div>
            <div className="col-xs-4">
              <small> Insert command argument</small>
              <i className="fa fa-question-circle-o m-l-sm"></i>
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
            className="task-remove-button btn btn-xs btn-danger"
            onClick={this.handleRemoveClick}
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>

        {task.command === 'upload' ?
          <div style={{ marginTop: '5px' }} className="col-xs-12 text-muted">
            This will upload files to your rinocloud project. You can specify a target
            folder in 'Upload to'.
          </div>
        :
        null}

        {task.command === 'copy' ?
          <div style={{ marginTop: '5px' }} className="col-xs-12 text-muted">
            Copies files to the target location. You can also set the location in Metadata
            {'  '}<a href="http://bot.rino.io">(see docs)</a>.
          </div>
        :
        null}

      </div>
    )
  }
}

export { TaskForm }
