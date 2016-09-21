import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { shell } from 'electron'

class PipelineForm extends React.Component {

  static propTypes = {
    registry: PropTypes.array,
    installedPlugins: PropTypes.array,
    pipeline: PropTypes.object.isRequired,
    onChangeMatch: PropTypes.func.isRequired,
    onChangeTaskName: PropTypes.func.isRequired,
    onChangeTaskArgs: PropTypes.func.isRequired,
    onChangeTaskKeep: PropTypes.func.isRequired,
    onChangeIncomingOnly: PropTypes.func.isRequired,
    onAddTask: PropTypes.func.isRequired,
    onRemoveTask: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  render() {
    const { pipeline, registry, installedPlugins } = this.props //eslint-disable-line

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
        <div className="row row-centered m-b">
          <div className="col-xs-4 col-centered">
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={fileOverlay}
            >
              <a
                style={{ top: '25px', left: '-3px' }}
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
            className="pipeline-position-x-file"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
          >
            <i className="fa fa-lg fa-remove btn-red-x"></i>
          </a>
        </div>
        <div className="row">
          <div className="config-incoming-checkbox">
            only operate on incoming files{'  '}
            <input
              key={`incoming_only${pipeline.incoming_only.toString()}`}
              type="checkbox"
              onClick={(e) => {
                e.preventDefault()
                this.props.onChangeIncomingOnly(e.target.checked)
              }}
              defaultChecked={pipeline.incoming_only}
            />
          </div>
        </div>

        <br />

        {pipeline.tasks.length !== 0 &&
          <div className="row row-centered">
            <div className="col-sm-12 text-center">
              <h6
                className="block-title"
                style={{ color: '#ccc' }}
              >
                TASKS
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
              </h6>
            </div>
          </div>
        }

        {_.map(pipeline.tasks, (task, index) => {
          return (
            <div key={`task-${index}`}>
              <TaskForm
                registry={registry}
                installedPlugins={installedPlugins}
                name={task.name}
                args={task.args}
                keep={task.keep}
                onChangeName={name => { this.props.onChangeTaskName(index, name) }}
                onChangeArgs={args => { this.props.onChangeTaskArgs(index, args) }}
                onChangeKeep={args => { this.props.onChangeTaskKeep(index, args) }}
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
          <div className="col-sm-12 m-t-sm text-center">
            <a
              href="#"
              className="btn-add-task"
              onClick={(e) => {
                e.preventDefault()
                this.props.onAddTask()
              }}
            >
              <i className="fa fa-plus m-r-sm" />
              <span>Add Task</span>
            </a>

          </div>
        </div>
        <hr />
      </div>
    )
  }
}

export { PipelineForm }
