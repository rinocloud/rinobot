import React from 'react'

export class TaskForm extends React.Component {

  constructor(props) {
    super(props)
    this.handleChangeMatch = this.handleChangeMatch.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
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
      <div>
        <div className="form-group">
          <label className="col-sm-2">pattern</label>
          <div className="col-sm-6">
            <input
              type="text"
              style={{ fontFamily: 'monospace' }}
              value={task.match || ''}
              className="form-control input-sm"
              onChange={this.handleChangeMatch('match')}
            />
          </div>
          <div className="col-sm-2">
            <button className="btn btn-danger" onClick={this.handleRemoveClick}>
              x
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2">plugin</label>
          <div className="col-sm-6">
            <select className="form-control input-sm" onChange={this.handleChangeMatch('plugin')}>
              {installedPackages.map((p, j) =>
                <option key={`op${j}`} defaultValue={p.name}>{p.name}</option>
              )}
            </select>
          </div>
        </div>

        {task.plugin === 'custom' ?
          <div>
            <div className="form-group">
              <label className="col-sm-2">command</label>
              <div className="col-sm-6">
                <input
                  type="text"
                  value={task.command || ''}
                  className="form-control input-sm"
                  onChange={this.handleChangeMatch('command')}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2">args</label>
              <div className="col-sm-6">
                <input
                  type="text"
                  value={task.args || ''}
                  className="form-control input-sm"
                  onChange={this.handleChangeMatch('args')}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2">on</label>
              <div className="col-sm-6">
                <input
                  type="text"
                  value={task.on || ''}
                  className="form-control input-sm"
                  onChange={this.handleChangeMatch('on')}
                />
              </div>
            </div>
          </div>
        : null}
      </div>
    )
  }
}
