import React, { PropTypes } from 'react'

import { TaskForm } from './TaskForm'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { MetadataForm } from './MetadataForm'

import { Link } from 'react-router' // eslint-disable-line
import Switch from 'react-bootstrap-switch' //eslint-disable-line
import 'react-bootstrap-switch/dist/css/bootstrap3/react-bootstrap-switch.css'
const { shell } = require('electron')


class ConfigurePipeline extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    packagesConfig: PropTypes.object,
    registry: PropTypes.array.isRequired,
    syncShowed: PropTypes.bool,
    taskShowed: PropTypes.bool,
    fileShowed: PropTypes.bool,
  }

  constructor(props) {
    super(props)
    this.handleChangeArrayObject = this.handleChangeArrayObject.bind(this)
    this.handleRemoveArrayObject = this.handleRemoveArrayObject.bind(this)
    this.handleAddTask = this.handleAddTask.bind(this)
    this.handleAddMetadata = this.handleAddMetadata.bind(this)
    this.handleFormDataChange = this.handleFormDataChange.bind(this)

    this.state = {
      formData: props.dir.config,
      syncShowed: true,
      taskShowed: true,
      fileShowed: true,
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
          { match: '*', command: 'default' }
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

    // const taskTitle = (
    //   <span>
    //     Task{'  '}
    //     <OverlayTrigger
    //       trigger={['hover']}
    //       placement="right"
    //       overlay={TasksOverlay}
    //     >
    //       <a
    //         className="fa fa-question-circle-o m-t-sm text-muted"
    //         href="http://docs.rinocloud.com/rinobot/tasks/getting_started.html"
    //         onClick={openExternal}
    //       >
    //       </a>
    //     </OverlayTrigger>
    //   </span>
    // )

    const metadataTitle = (
      <span>
        My metadata{'  '}
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
    const onSyncro = (e) => {
      e.preventDefault()
      this.setState({ syncShowed: !this.state.syncShowed })
    }
    const toggleShowFile = (e) => {
      e.preventDefault()
      this.setState({ fileShowed: !this.state.fileShowed })
    }
    const toggleShowTask = (e) => {
      e.preventDefault()
      this.setState({ taskShowed: !this.state.taskShowed })
    }


    return (
      <div className="m-t config">
        <div className="row">
          {/* <div className="where">
            <a
              href="#"
              className="panel-title"
              style={{ 'backgroundColor': 'white' }}// eslint-disable-line
            >
              Cloud Syncronization
            </a>
          </div>
          <h3
            className="what"
            onClick={(e) => {
              e.preventDefault()
              onSyncro(e)
            }}
          >
            <Switch
              onColor="info"
              offColor="warning"
              bsSize="mini"
              onText="Yes"
              offText="No"
              labelText=""
              handleWidth="auto"
              labelWidth="auto"
              baseClass="bootstrap-switch"
              wrapperClass="switch-hide-help"
            />
          </h3>
        {this.state.syncShowed ?
          <p className="description">
            <div className="row">
              <div className="col-xs-4">
                <small>Upload to</small>
                <input
                  placeholder="target folder in rinocloud"
                  type="text"
                  className="form-control input-sm"
                />
              </div>
            </div>
          </p>
          : null} */}


            <div className="col-xs-12">
              <small> Add file to match </small>
              <input
                type="text"
                className="form-control input-sm"
              />
            </div>

          {!this.state.taskShowed ?

            <div className="where">
              <p className="description m-t">
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
              </p>

              {/*<p className="description m-t">
                <div className="m-t">
                {formData.metadata.map((o, index) =>
                  <div className="p-l m-t" key={`metadiv${index}`}>
                  {metadataTitle}
                    <MetadataForm
                      key={`meta${index}`}
                      object={o}
                      onChange={(obj) => this.handleChangeArrayObject('metadata')(index, obj)}
                      onRemove={() => this.handleRemoveArrayObject('metadata')(index)}
                    />
                  </div>
                )}
                </div>
              </p>
              <li
                onClick={this.handleAddMetadata}
              >
                <div className="where m-t">Add Metdata</div>
              </li>*/}
            </div>

          :
            <div
              onClick={(e) => {
                e.preventDefault()
                toggleShowTask(e)
              }}
            >
              <div className="where"> Add task </div>
            </div>
        }
        </div>
      </div>
    )
  }
}

export { ConfigurePipeline }
