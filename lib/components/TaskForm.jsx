import React from 'react'
import _ from 'lodash'
import pt from 'path'
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
    return function (e, val = null) {
      e.preventDefault()
      const state = {
        ...task,
        [field]: val || e.target.value
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
    const { task, pop, packagesConfig } = this.props //eslint-disable-line
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

    let installDeps = []

    if (packagesConfig && packagesConfig.dependencies) {
      installDeps = _.keys(packagesConfig.dependencies).map((dep) => ({
        name: dep.replace('rinobot-plugin-', ''),
        value: dep
      }))
    }

    const commandList = [
      { name: 'rinocloud upload', value: 'upload' },
      { name: 'copy', value: 'copy' },
      { name: 'move', value: 'move' },
      { name: 'matlab', value: 'matlab' },
      { name: 'python', value: 'python' },
      { name: 'Rscript', value: 'Rscript' },
      { name: 'custom', value: 'custom' },
      ...installDeps
    ]

    const isCustomCommand = (
      !_.map(commandList, 'value').includes(task.command) ||
      task.command === 'custom'
    )

    let selectedValue = task.command || ''
    if (isCustomCommand) {
      selectedValue = 'custom'
    }

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
                href="http://docs.rinocloud.com/rinobot/tasks/getting_started.html"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>
          : null}
          <select
            type="text"
            value={selectedValue}
            className="form-control"
            onChange={this.handleChangeMatch('command')}
          >
            {commandList.map((c) =>
              <option key={c.value} value={c.value}>
                {c.name}
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

        {['copy', 'move'].includes(task.command) ?
          <div className="col-xs-5">
            <div className="col-xs-2">
              <br />
              <button
                className="btn btn-sm btn-default"
                style={{ border: 'none' }}
              >
                to
              </button>
            </div>
            <div className="col-xs-4">
              <br />
              <a
                href="#"
                className="btn btn-default btn-sm"
                onClick={(e) => {
                  e.preventDefault()
                  const paths = dialog.showOpenDialog({ properties: ['openDirectory'] }) // eslint-disable-line
                  if (paths) {
                    this.handleChangeMatch('args')(e, paths[0])
                  }
                }}
              >
                Select folder
              </a>
            </div>
            <div className="col-xs-6">
             <br />
              <input
                type="text"
                value={task.args || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('args')}
                placeholder="or type a location"
              />
            </div>
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
                this.handleChangeMatch('args')(e, paths[0])
              }
            }}
          >
            Select {task.command === 'Rscript' ? 'R' : task.command} file
            {task.args ? ` (${pt.basename(task.args)})` : ''}
          </a>
        </div>
        : null}

        {isCustomCommand ?
          <div>
            <div className="col-xs-2">
              <small>Command to run</small>
              <input
                type="text"
                value={task.command || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('command')}
              />
            </div>
            <div className="col-xs-3">
              <small>Insert command argument</small>
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

        <div className="col-xs-12">
          {task.command === 'upload' ?
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/uploading_to_rinocloud.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-question-circle-o m-r-sm"></i>
              {'  '}uploading to rinocloud
            </a>
          :
          null}
          {['copy', 'move'].includes(task.command) ?
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/copying_moving_files.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-question-circle-o m-r-sm"></i>
              {'  '}copy/move files
            </a>
          :
          null}
          {task.command === 'matlab' ?
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_matlab.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-question-circle-o m-r-sm"></i>
              {'  '}running matlab scripts
            </a>
          :
          null}

          {task.command === 'python' ?
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_python.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-question-circle-o m-r-sm"></i>
              {'  '}running python scripts
            </a>
          : null}

          {task.command === 'Rscript' ?
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_r.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-question-circle-o m-r-sm"></i>
              {'  '}running r scripts
            </a>
          : null}

          {task.command === 'custom' ?
            <a
              href="http://docs.rinocloud.com/rinobot/tasks/running_custom_commands.html"
              onClick={openExternal}
              className="text-muted"
            >
              <i className="fa fa-question-circle-o m-r-sm"></i>
              {'  '}running custom commands
            </a>
          : null}
        </div>
      </div>
    )
  }
}

export { TaskForm }
