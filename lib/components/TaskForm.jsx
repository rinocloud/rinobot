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
    const CommandToRunPopover = (
      <Popover id="popover-trigger-hover-focus">
        <small>
          These are actions that will happen when files appear in the folder.
          Click to learn more.
        </small>
      </Popover>
    )
    const MatchPopover = (
      <Popover id="popover-trigger-hover-focus">
        <small>
          This lets you choose only certain filetypes to run tasks on. <code>*</code>
          means everything, but <code>*.txt</code> would only work on 'txt' files.
          Click to learn more.
        </small>
      </Popover>
    )

    return (
      <div className="form-group">
        <div className="col-xs-4">
          <small>Select command to run</small>
          {pop ?
            <OverlayTrigger
              trigger={['hover']}
              placement="right"
              overlay={CommandToRunPopover}
            >
              <a
                className="fa fa-question-circle-o m-l-sm text-muted"
                href="http://docs.rinocloud.com/rinobot/tasks/running_commands.html"
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
              <option key={packageName} value={packageName}>
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
              placement="right"
              overlay={MatchPopover}
            >
              <a
                className="fa fa-question-circle-o m-l-sm text-muted"
                href="http://docs.rinocloud.com/rinobot/tasks/matching_files.html"
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
            <input
              placeholder="target folder in rinocloud"
              type="text"
              value={task.args || ''}
              className="form-control input-sm"
              onChange={this.handleChangeMatch('args')}
            />
          </div>
        : null}

        {task.command === 'copy' ?
          <div className="col-xs-4">
            <small>Destination folder </small>
            <input
              type="text"
              value={task.args || ''}
              className="form-control input-sm"
              onChange={this.handleChangeMatch('args')}
              placeholder="target folder"
            />
          </div>
        : null}

      {['python', 'Rscript', 'matlab'].includes(task.command) ?
        <div className="col-xs-4">
          <div>
            <br />
          </div>
          <a
            href="#"
            className="btn btn-default btn-sm"
            onClick={(e) => {
              e.preventDefault()
                const paths = dialog.showOpenDialog({ properties: ['openFile'] }) // eslint-disable-line
              if (paths) {
                console.log(paths[0])
                this.handleChangeMatch('args')(e, paths[0])
              }
            }}
          >Select {task.command === 'Rscript' ? 'R' : task.command} file</a>
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
          <div className="col-xs-12">
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/uploading_to_rinocloud.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-info-circle m-r-sm"></i>
              {'  '}uploading to rinocloud
            </a>
          </div>
        :
        null}

        {task.command === 'copy' ?
          <div className="col-xs-12">
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/copying_moving_files.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-info-circle m-r-sm"></i>
              {'  '}copying files
            </a>
          </div>
        :
        null}
        {task.command === 'matlab' ?
          <div className="col-xs-12">
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_matlab.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-info-circle m-r-sm"></i>
              {'  '}running matlab scripts
            </a>
          </div>
        :
        null}

        {task.command === 'python' ?
          <div className="col-xs-12">
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_python.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-info-circle m-r-sm"></i>
              {'  '}running python scripts
            </a>
          </div>
        : null}

        {task.command === 'Rscript' ?
          <div className="col-xs-12">
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_r.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-info-circle m-r-sm"></i>
              {'  '}running r scripts
            </a>
          </div>
        : null}

        {task.command === 'custom' ?
          <div className="col-xs-12">
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_custom_commands.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-info-circle m-r-sm"></i>
              {'  '}running custom commands
            </a>
          </div>
        : null}
      </div>
    )
  }
}

export { TaskForm }
