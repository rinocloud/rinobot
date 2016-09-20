import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import Switch from 'react-bootstrap-switch'
import 'react-bootstrap-switch/dist/css/bootstrap3/react-bootstrap-switch.css'
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

    const filePopover = (
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

    const fileOverlay = (
      <OverlayTrigger
        trigger={['hover']}
        placement="right"
        overlay={filePopover}
      >
        <a
          style={{ right: '282px', top: '1px' }}
          className="fa fa-question-circle-o text-muted col-xs-1 pull-right"
          href="http://docs.rinocloud.com/rinobot/metadata/getting_started.html"
          onClick={openExternal}
        >
        </a>
      </OverlayTrigger>
    )
    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    return (
      <div className="row">
        <div className="col-xs-12 m-b">
          <div className="col-xs-3">
            <div className="input-group">
              <span className="input-group-btn">
                <button className="btn btn-sm btn-info" type="button">Yes</button>
              </span>
              <div
                type="text"
                className="form-control form-control-primar"
                placeholder="All type of Files"
              >Click for all type of file</div>
            </div>
          </div>
          <div className="col-xs-1 m-t-sm">
            <strong> or </strong>
          </div>
          <div className="col-xs-4">

            <input
              className="form-control form-control-primar"
              placeholder="Type of file to match"
              value={pipeline.filematch || ''}
              onChange={(e) => {
                e.preventDefault()
                this.props.onChangeMatch(e.target.value)
              }}
            />
          </div>
          {fileOverlay}
          <a
            className="position-x-file"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
          >
            <i className="fa fa-lg fa-remove btn-red-x"></i>
          </a>

        </div>
        {/* {pipeline.tasks.length !== 0 &&
          <div className="row">
            <div className="col-sm-12 m-t">
              <h6
                className="block-title"
                style={{ color: '#666' }}
              >
                My tasks {'  '}
                <span>
                  <OverlayTrigger
                    trigger={['hover']}
                    placement="bottom"
                    overlay={TaskOverlay}
                  >
                    <a
                      className="fa fa-question-circle-o text-muted"
                      href="http://docs.rinocloud.com/rinobot/tasks/getting_started.html"
                      onClick={openExternal}
                    >
                    </a>
                  </OverlayTrigger>
                </span>
              </h6>
            </div>
          </div>
        }*/}

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
                <div className="col-sm-12">
                  {index !== pipeline.tasks.length - 1 &&
                    <i className="fa fa-arrow-down text-muted m-l-lg m-t-sm m-b-sm"></i>
                  }
                </div>
              </div>
            </div>
          )
        })}
        <div className="row">
          <div className="col-sm-12 m-l-sm">
            <a
              href="#"
              className="btn-Metask"
              onClick={(e) => {
                e.preventDefault()
                this.props.onAddTask()
              }}
            >
              <i className="fa fa-plus-circle m-l-sm m-t-sm" />
              {/*<br />*/}
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
