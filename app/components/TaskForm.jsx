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
          <small>files to match (* for everything)</small>
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
          <input
            type="text"
            value={task.command || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('command')}
          />
        </div>

        <div className="col-sm-1">
          <button
            className="task-remove-button btn btn-xs btn-danger"
            onClick={this.handleRemoveClick}
          >
            <i className="fa fa-remove"></i>
          </button>
        </div>

        <div className="col-sm-4">
          <small>command arguments (optional)</small>
          <input
            type="text"
            placeholder=""
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
