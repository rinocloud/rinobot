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
        <div className="row">
          <div className="col-xs-4">
            <input
              className="form-control form-control-primary"
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
            className="m-l"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
          >
            remove pipeline
          </a>
        </div>

        {_.map(pipeline.tasks, (task, index) => {
          return (
            <div key={`task-${index}`}>
              <TaskForm
                registry={registry}
                packagesConfig={packagesConfig}
                name={task.name}
                args={task.args}
                onChangeName={(name) => { this.props.onChangeTaskName(index, name) }}
                onChangeArgs={(args) => { this.props.onChangeTaskArgs(index, args) }}
                onRemove={() => { this.props.onRemoveTask(index) }}
              />
              <div className="row m-l">
                <div className="text-center m-t col-xs-4">
                  {(index === pipeline.tasks.length - 1) &&
                    <a
                      href="#"
                      className="m-l"
                      onClick={(e) => {
                        e.preventDefault()
                        this.props.onAddTask()
                      }}
                    >
                      <i className="fa fa-plus" />
                    </a>
                  }

                  {index !== pipeline.tasks.length - 1 &&
                    <i className="m-l fa fa-arrow-down fa-x" />
                  }
                </div>
              </div>
            </div>
          )
        })}

        <div className="row m-l">
          <div className="text-center m-t col-xs-4">
            {pipeline.tasks.length === 0 &&
              <a
                href="#"
                className="m-l"
                onClick={(e) => {
                  e.preventDefault()
                  this.props.onAddTask()
                }}
              >
                <i className="fa fa-plus" />
                <small
                  className="m-l-sm text-muted"
                >
                  (Add task)
                </small>
              </a>
            }

          </div>
        </div>


      </div>
    )
  }
}

export { PipelineForm }
