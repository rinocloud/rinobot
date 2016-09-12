import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { TaskForm } from './TaskForm'
import { Tabs, Tab, Popover, OverlayTrigger } from 'react-bootstrap'
import { MetadataForm } from './MetadataForm'
const { shell } = require('electron')


class ConfigurePipeline extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    packagesConfig: PropTypes.object,
    registry: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleChangeArrayObject = this.handleChangeArrayObject.bind(this)
    this.handleRemoveArrayObject = this.handleRemoveArrayObject.bind(this)
    this.handleAddTask = this.handleAddTask.bind(this)
    this.handleAddMetadata = this.handleAddMetadata.bind(this)
    this.handleFormDataChange = this.handleFormDataChange.bind(this)

    this.state = {
      formData: props.dir.config
    }
  }

  handleFormDataChange() {
    this.props.onSetConfig(this.state.formData)
  }

  handleChangeArrayObject(field) {
    const self = this
    return function (index, obj) {
      self.setState({
        formData: {
          ...self.state.formData,
          [field]: [
            ...self.state.formData[field].slice(0, index),
            obj,
            ...self.state.formData[field].slice(index + 1)
          ]
        }
      }, self.handleFormDataChange)
    }
  }

  handleRemoveArrayObject(field) {
    const self = this
    return function (index) {
      self.setState({
        formData: {
          ...self.state.formData,
          [field]: [
            ...self.state.formData[field].slice(0, index),
            ...self.state.formData[field].slice(index + 1)
          ]
        }
      }, self.handleFormDataChange)
    }
  }

  handleAddTask(e) {
    e.preventDefault()
    const tasks = this.state.formData.tasks
    this.setState({
      formData: {
        ...this.state.formData,
        tasks: [
          ...tasks,
          { match: '*', command: 'upload' }
        ]
      }
    })
  }

  handleAddMetadata(e) {
    e.preventDefault()
    const metadata = this.state.formData.metadata
    this.setState({
      formData: {
        ...this.state.formData,
        metadata: [
          ...metadata,
          { field: '', value: '' }
        ]
      }
    })
  }

  render() {
    const { packagesConfig, registry } = this.props
    const { formData } = this.state
    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const TasksOverlay = (
      <Popover
        id="popover-trigger-hover-focus"
      >
        <small>
          This is where you setup tasks to run when files appear in the watched folder.
          Click to learn more.
        </small>
      </Popover>
    )

    const MetadataOverlay = (
      <Popover
        id="popover-trigger-hover-focus"
      >
        <small>
          This is where you can add metadata to all files which will be uploaded.
          Metadata can also be referenced in task arguments. Click to learn more.
        </small>
      </Popover>
    )

    const taskTitle = (
      <span>
        Task{'  '}
        <OverlayTrigger
          trigger={['hover']}
          placement="right"
          overlay={TasksOverlay}
        >
          <a
            className="fa fa-question-circle-o m-t-sm text-muted"
            href="http://docs.rinocloud.com/rinobot/tasks/getting_started.html"
            onClick={openExternal}
          >
          </a>
        </OverlayTrigger>
      </span>
    )

    const metadataTitle = (
      <span>
        Metadata{'  '}
        <OverlayTrigger
          trigger={['hover']}
          placement="right"
          overlay={MetadataOverlay}
        >
          <a
            className="fa fa-question-circle-o m-t-sm text-muted"
            href="http://docs.rinocloud.com/rinobot/metadata/getting_started.html"
            onClick={openExternal}
          >
          </a>
        </OverlayTrigger>
      </span>
    )

    return (
      <div className="m-t config">
        <div className="row">
          <div className="col-sm-12">
            <form className="form form-horizontal">

              <Tabs defaultActiveKey={1} id="uncontrolled-tab">
                <Tab eventKey={1} title={taskTitle} >

                  <div className="row">
                    <div className="p-l m-t row">
                      <div className="col-xs-12">
                        Any{'  '}
                        <Link to="/plugins">Plugins</Link>{'  '}
                        you install will automatically appear in the command list.
                      </div>
                    </div>

                    {formData.tasks.map((o, i) =>
                      <div className="p-l m-t" key={`taskdiv${i}`}>
                        <TaskForm
                          key={`task${i}`}
                          pop={i === 0}
                          task={o}
                          packagesConfig={packagesConfig}
                          onChange={(obj) => this.handleChangeArrayObject('tasks')(i, obj)}
                          onRemove={() => this.handleRemoveArrayObject('tasks')(i)}
                          registry={registry}
                        />
                      </div>
                    )}

                    <button
                      className="m-l btn btn-xs btn-success"
                      onClick={this.handleAddTask}
                    >
                      Add task <i className="fa fa-plus"> </i>
                    </button>
                  </div>
                </Tab>

                <Tab eventKey={2} title={metadataTitle}>
                  <div className="m-t">
                    {formData.metadata.map((o, index) =>
                      <div className="p-l m-t" key={`metadiv${index}`}>
                        <MetadataForm
                          key={`meta${index}`}
                          object={o}
                          onChange={(obj) => this.handleChangeArrayObject('metadata')(index, obj)}
                          onRemove={() => this.handleRemoveArrayObject('metadata')(index)}
                        />
                      </div>
                    )}
                    <button
                      className="m-l btn btn-xs btn-success"
                      onClick={this.handleAddMetadata}
                    >
                      Add Metadata <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </Tab>

              </Tabs>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export { ConfigurePipeline }
