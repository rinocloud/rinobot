import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { shell } from 'electron'

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

    const fileOverlay = (
      <Popover
        id="popover-trigger-hover-focus"
      >
        <small>
          This lets you specify on certain filetypes to run a pipeline of tasks on. <code>*</code>
          means everything, but <code>*.txt</code> would only work on 'txt' files.
          Click to learn more.
        </small>
      </Popover>
    )

    const TaskOverlay = (
      <Popover
        id="popover-trigger-hover-focus"
      >
        <small>
          These are actions that will happen when files appear in the folder.
          Click to learn more.
        </small>
      </Popover>
    )

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    return (
      <div className="row">
        <div className="row row-centered m-t m-b">
          <div className="col-xs-4 col-centered">
            <OverlayTrigger
              trigger={['hover']}
              placement="right"
              overlay={fileOverlay}
            >
              <a
                style={{ top: '19px' }}
                className="fa fa-question-circle-o text-muted col-xs-1 pull-right"
                href="http://docs.rinocloud.com/rinobot/metadata/getting_started.html"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>
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
            className="position-x-file"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
          >
            <i className="fa fa-lg fa-remove btn-red-x m-t"></i>
          </a>
        </div>
        {pipeline.tasks.length !== 0 &&
          <div className="row">
            <div className="col-sm-12 text-center">
              <h6
                className="block-title"
                style={{ color: '#999' }}
              >
                Setup a task {'  '}
                <span>
                  <OverlayTrigger
                    trigger={['hover']}
                    placement="bottom"
                    overlay={TaskOverlay}
                  >
                    <a
                      className="fa fa-question-circle-o m-t-sm text-muted"
                      href="http://docs.rinocloud.com/rinobot/tasks/getting_started.html"
                      onClick={openExternal}
                    >
                    </a>
                  </OverlayTrigger>
                </span>
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
              className="btn-Metask m-t m-b-sm"
              onClick={(e) => {
                e.preventDefault()
                this.props.onAddTask()
              }}
            >
              <i className="fa fa-plus-circle" />
              <br />
              <small>Add Task</small>
            </a>

          </div>
        </div>
        <hr />
      </div>
    )
  }
}

export { PipelineForm }
