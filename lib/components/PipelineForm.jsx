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
      <div className="container">
        <div className="row-centered ">
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
          {pipeline.tasks.length === 0 ?
            null
          :
          <h6
            className="text-center m-t m-r-lg"
            style={{ color: '#666' }}
          >
          My Pipeline Form</h6>
        }
        </div>
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
              <div className="row row-centered">
                <div className="col-xs-2 col-centered">
                  {(index === pipeline.tasks.length - 1) &&
                    <a
                      href="#"
                      className="btn btn-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        this.props.onAddTask()
                      }}
                    >
                      <i className="fa fa-plus-circle fa-3x btn-blue" />
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
        <div className="row row-centered">
          <div className="col-xs-2 col-centered">
            {pipeline.tasks.length === 0 &&
              <a
                href="#"
                className="btn btn-sm"
                onClick={(e) => {
                  e.preventDefault()
                  this.props.onAddTask()
                }}
              >
                <i className="fa fa-plus-circle fa-3x btn-blue" />
              </a>
            }

          </div>
        </div>
      </div>
    )
  }
}

export { PipelineForm }
