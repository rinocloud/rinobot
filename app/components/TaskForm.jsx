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
        <div className="col-sm-3">
          <small>files to match</small>
          <input
            type="text"
            style={{ fontFamily: 'monospace' }}
            value={task.match || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('match')}
          />
        </div>

        <div className="col-sm-3">
          <small>command to run</small>

          {/*

            gets a question mark to explain

            change to a select box with these options:

              rinocloud (upload)
              copy
              python
              matlab
              rscript

              custom/other

            if you press other, another box appears
            asking for a command name (this box gets a question mark)
            */}

          <input
            type="text"
            style={{ fontFamily: 'monospace' }}
            value={task.command || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('command')}
          />

          {task.command === 'custom' ?
            <div>
            {/* this is where the extra input box goes*/}
            </div>
            :
            null
          }
        </div>

        <div className="col-sm-1">
          <button
            className="task-remove-button btn btn-xs btn-danger"
            onClick={this.handleRemoveClick}
          >
            <i className="fa fa-remove"></i>
          </button>
        </div>

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

        <div className="col-sm-4">
          <small>command arguments (optional)</small>
          <input
            type="text"
            placeholder=""
            style={{ fontFamily: 'monospace' }}
            value={task.args || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('args')}
          />
        </div>

      </div>
    )
  }
}

export { TaskForm }
