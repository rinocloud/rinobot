import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import _ from 'lodash'


class PipelineForm extends React.Component {

  static propTypes = {
    registry: PropTypes.array,
    packagesConfig: PropTypes.object,
    pipeline: PropTypes.object.isRequired,
    onChangeMatch: PropTypes.func.isRequired,
    onChangeTaskName: PropTypes.func.isRequired,
    onChangeTaskArgs: PropTypes.func.isRequired,
    onAddTask: PropTypes.func.isRequired,
    onRemoveTask: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  render() {
    const { pipeline, registry, packagesConfig } = this.props //eslint-disable-line

    return (
      <div className="row m-l">
        <div className="row m-t">
          <div className="col-xs-4">
            <h7>Type of file to match</h7>
            <input
              className="form-control"
              placeholder="trigger file"
              value={pipeline.filematch || ''}
              onChange={(e) => {
                e.preventDefault()
                this.props.onChangeMatch(e.target.value)
              }}
            />
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
          >
            <i className="m-l m-t fa fa-lg fa-remove btn-red-x"></i>
          </a>
        </div>
        <ul className="experiences m-t">
        {_.map(pipeline.tasks, (task, index) => {
          return (
            <li>
            <TaskForm
              key={`task-${index}`}
              registry={registry}
              packagesConfig={packagesConfig}
              name={task.name}
              args={task.args}
              onChangeName={(name) => { this.props.onChangeTaskName(index, name) }}
              onChangeArgs={(args) => { this.props.onChangeTaskArgs(index, args) }}
              onRemove={() => { this.props.onRemoveTask(index) }}
            />
            </li>
          )
        })}
        </ul>
        <div className="row text-muted m-l">
          <a
            href="#"
            className="fa fa-plus btn btn-info btn-sm"
            onClick={(e) => {
              e.preventDefault()
              this.props.onAddTask()
            }}
          /> {'  '}
            Add task
        </div>
      </div>
    )
  }
}

export { PipelineForm }
