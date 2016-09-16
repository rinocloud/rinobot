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
      <div className="row">
        <div className="row row-centered m-t m-b">
          <div className="col-xs-4 col-centered">
            <input
              className="form-control form-control-primary"
              placeholder="Type of file to match"
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

        {pipeline.tasks.length !== 0 &&
          <div className="row">
            <div className="col-sm-12 text-center">
              <h6
                className="block-title"
                style={{ color: '#999' }}
              >
                Setup a task
              </h6>
            </div>
          </div>
        }

        {_.map(pipeline.tasks, (task, index) => {
          return (
            <div>
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
              <div className="row">
                <div className="col-sm-12 text-center m-t">
                  {index !== pipeline.tasks.length - 1 &&
                    <i className="fa fa-arrow-down text-muted"></i>
                  }
                </div>
              </div>
            </div>
          )
        })}

        <div className="row">
          <div className="col-sm-12 text-center m-t">
            <a
              href="#"
              className="btn-sm"
              style={{
                fontSize: '1.4em'
              }}
              onClick={(e) => {
                e.preventDefault()
                this.props.onAddTask()
              }}
            >
              <i className="fa fa-plus text-muted"></i>
              <small style={{ color: '#999', marginLeft: '5px' }}>
                Add a Task
              </small>
            </a>
          </div>
        </div>

        <hr />

      </div>
    )
  }
}

export { PipelineForm }
