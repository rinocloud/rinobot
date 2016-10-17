import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import _ from 'lodash'

class PipelineForm extends React.Component {

  static propTypes = {
    registry: PropTypes.array,
    installedPlugins: PropTypes.array,
    pipeline: PropTypes.object.isRequired,
    onChangeMatch: PropTypes.func.isRequired,
    onChangeTaskName: PropTypes.func.isRequired,
    onChangeTaskArgs: PropTypes.func.isRequired,
    onChangeTaskKeep: PropTypes.func.isRequired,
    onChangeTaskFlow: PropTypes.func.isRequired,
    onChangeIncomingOnly: PropTypes.func.isRequired,
    onAddTask: PropTypes.func.isRequired,
    onRemoveTask: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  render() {
    const { pipeline, registry, installedPlugins } = this.props //eslint-disable-line

    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="row row-task">
            <div className="sf_wrapper_task">
              <div className="grey_horz_task grey_horz_task-faux"></div>
            </div>
            <div className="col-xs-11 m-b">
              <div className="row">
                <div className="col-xs-12">
                  <div className="row">
                    <div className="col-xs-4">
                      <input
                        className="form-control m-b-sm"
                        placeholder="Files to automate..."
                        value={pipeline.filematch || ''}
                        onChange={(e) => {
                          e.preventDefault()
                          this.props.onChangeMatch(e.target.value)
                        }}
                      />
                    </div>
                    <div className="col-xs-2 col-xs-offset-6">
                      <a
                        className="btn btn-sm pull-right"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          this.props.onRemove()
                        }}
                      >
                        <i className="fa fa-times-circle-o m-r-sm" />
                        Delete pipeline
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row-flow-toggle">
                <div className="toggle toggle-faux btn-group btn-group-xs m-t-sm m-b-sm">
                  <a
                    className="btn-flow active"
                  >
                    THEN
                  </a>
                </div>
              </div>
            </div>
          </div>


          {_.map(pipeline.tasks, (task, index) => {
            let isAnd = false
            let nextTask = null
            if (index !== pipeline.tasks.length - 1) {
              nextTask = pipeline.tasks[index + 1]
            }
            if (task.flow === 'and' || (nextTask && nextTask.flow === 'and')) {
              isAnd = true
            }

            let horzClass = 'grey_horz_task'
            if (index === 0) {
              horzClass = 'grey_horz_task grey_horz_task_first'
            }
            if (index === pipeline.tasks.length - 1) {
              // !nextTask || nextTask.flow !== 'and'
              horzClass = 'grey_horz_task grey_horz_task_last'
            }
            if (pipeline.tasks.length === 1) {
              horzClass = 'grey_horz_task grey_horz_task_only'
            }

            return (
              <div
                className={
                  `row row-task ${(isAnd && 'row-and')}`
                }
                key={`task-${index}`}
              >
                <div className="sf_wrapper_task">
                  <div className={horzClass}></div>
                </div>
                <div className="col-xs-11">
                  {index > 0 &&
                    <div className="row-flow">
                      <div className="m-t m-b">
                        <div className="toggle btn-group btn-group-xs m-t-sm m-b-sm">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              this.props.onChangeTaskFlow(index, 'then')
                            }}
                            className={
                              'btn-flow ' // eslint-disable-line
                              + (pipeline.tasks[index].flow === 'then' && 'active') // eslint-disable-line
                            }
                          >
                            THEN
                          </a>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              this.props.onChangeTaskFlow(index, 'and')
                            }}
                            className={
                              'btn-flow ' // eslint-disable-line
                              + (pipeline.tasks[index].flow === 'and' && 'active') // eslint-disable-line
                            }
                          >
                            AND
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                  <div className="row">
                    <div className="col-xs-12">
                      <TaskForm
                        registry={registry}
                        installedPlugins={installedPlugins}
                        name={task.name}
                        args={task.args}
                        keep={task.keep}
                        showRemove={index !== 0}
                        onChangeName={name => { this.props.onChangeTaskName(index, name) }}
                        onChangeArgs={args => { this.props.onChangeTaskArgs(index, args) }}
                        onChangeKeep={args => { this.props.onChangeTaskKeep(index, args) }}
                        onRemove={() => { this.props.onRemoveTask(index) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="row">
            {pipeline.tasks.length === 0 &&
              <a
                href="#"
                className="btn-add-task"
                onClick={(e) => {
                  e.preventDefault()
                  this.props.onAddTask()
                }}
              >
                <i className="fa fa-plus-circle" />
              </a>
            }
            {pipeline.tasks.length !== 0 &&
              <a
                href="#"
                className="btn-add-task"
                onClick={(e) => {
                  e.preventDefault()
                  this.props.onAddTask()
                }}
              >
                <i className="fa fa-plus-circle" />
              </a>
            }
          </div>
        </div>
      </div>
    )
  }
}

export { PipelineForm }
