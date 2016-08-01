import React from 'react'

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

    return (
      <div className="form-group">
        <div className="col-xs-3 ">
          <small> Select comand to run</small>
          <i className="fa fa-question-circle-o m-l-sm"></i>
          <select
            type="text"
            style={{ fontFamily: 'monospace' }}
            value={task.command || ''}
            className="form-control custom-select full-width"
            onChange={this.handleChangeMatch('command')}
          >
            <option value="upload">Rinocloud-Upload</option>
            <option value="copy" >Copy</option>
            <option value="list">Python</option>
            <option value="list">MATLAB</option>
            <option value="list">R</option>
            <option value="custom">Custom/Other</option>
          </select>
        </div>

        <div className="col-xs-3">
          <small> Add file to match
            <i className='fa fa-question-circle-o m-l-sm'></i>
          </small>

          <input
            placeholder="*.for all files"
            type="text"
            style={{ fontFamily: 'monospace' }}
            value={task.task || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('task')}
          />
        </div>
          {task.command === 'upload' ?
            <div className="col-xs-3">
              <small>Upload to</small>
              <input
                placeholder="write your Rinocloud folder"
                type="text"
                style={{ fontFamily: 'monospace' }}
                value={task.command || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('command')}
              />
            </div>
            : null}
          {task.command === 'copy' ?
            <div className="col-xs-3">
              <small>Select destination folder
                <i className='fa fa-question-circle-o m-l-sm'></i>
              </small>
              <input
                type="text"
                style={{ fontFamily: 'monospace' }}
                value={task.command || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('command')}
              />
            </div>
            : null}
            {/* add changes */}
            {task.command === 'list' ?
              <div className="col-xs-3">
                <small>Select package
                  <i className="fa fa-question-circle-o m-l-sm"></i>
                </small>
                <select
                  type="text"
                  style={{ fontFamily: 'monospace' }}
                  // value={task.command || ''}
                  className="form-control  custom-select"
                  // onChange={this.handleChangeMatch('command')}
                >
                  <option>Python integration</option>
                  <option>MATLAB integration</option>
                  <option>R integration</option>
                </select>

              </div>
              : null}
          {task.command === 'custom' ?
            <div className="col-xs-3">
              <small>Insert command name</small>
              <i className='fa fa-question-circle-o m-l-sm'></i>
              <input
                type="text"
                style={{ fontFamily: 'monospace' }}
                value={task.command || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('command')}
              />
            </div>

            :
            null
          }

        {/*
          this is the box for the argument of the command

          gets question marks

          if command is:
            - upload -> no box needed
            - copy -> box has copy to location ? can be a string, or even folder box
            - pytohn, matlab, Rscript -> then show list of packages

          list of packages:

            selectBox like before which renders the items in the list
            installedPackages.

            but you need to add another option called other, where they
            can add file
        */}

        {/* <div className="col-sm-4">
          <small>command arguments (optional)</small>
          <input
            type="text"
            placeholder=""
            style={{ fontFamily: 'monospace' }}
            value={task.args || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('args')}
          />
        </div>*/}

        {/* I have to add   onClick={this.handleAddTask}*/}

        <div className="col-xs-1 pull-right">
          <button
            className="task-remove-button btn btn-xs btn-danger"
            onClick={this.handleRemoveClick}
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      </div>
    )
  }
}

export { TaskForm }
