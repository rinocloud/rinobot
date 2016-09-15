import React, { PropTypes } from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { Link } from 'react-router'
import { shell } from 'electron'
import { TaskForm } from './TaskForm'
import { MetadataForm } from './MetadataForm'
import { LogScroll } from './LogScroll'


const ClearRecord = (
  <Popover
    id="popover-trigger-hover-focus"
  >
    <small>
      This will clear Rinobots logs for this folder, so you can re-run all tasks.
      Click to learn more.
    </small>
  </Popover>
)

class WatchDir extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onStartClick: PropTypes.func.isRequired,
    isStarting: PropTypes.bool.isRequired,
    onStopClick: PropTypes.func.isRequired,
    onRemoveDirClick: PropTypes.func.isRequired,
    onSaveConfig: PropTypes.func.isRequired,
    removeDotRino: PropTypes.func.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    registry: PropTypes.array.isRequired,
    packagesConfig: PropTypes.object
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
    const { dir, registry, packagesConfig, isStarting } = this.props
    const { formData } = this.state

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const onStartClick = (e) => {
      e.preventDefault()
      this.props.onStartClick()
    }

    const onStopClick = (e) => {
      e.preventDefault()
      this.props.onStopClick()
    }

    const onRemoveDirClick = (e) => {
      e.preventDefault()
      this.props.onRemoveDirClick()
    }

    const onSaveConfig = (e) => {
      e.preventDefault()
      this.props.onSaveConfig()
    }

    const openPluginHomepage = (e) => {
      e.preventDefault()
      shell.showItemInFolder(dir.path)
    }

    const removeDotRino = (e) => {
      e.preventDefault()
      if (confirm("All data will be re-processed next time. Are you sure you want to do this?")) { // eslint-disable-line
        this.props.removeDotRino()
      }
    }

    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            {dir.path}
            <a
              href="#"
              onClick={openPluginHomepage}
              className="pull-right"
            >
              Open <i className="fa fa-external-link"></i>
            </a>

            <a
              href="#"
              className="pull-right m-r"
              onClick={removeDotRino}
            >
              Clear record
            </a>
            <a
              href="#"
              className="m-r pull-right"
              onClick={onRemoveDirClick}
            >
              <span><i className="fa fa-trash"></i> Remove</span>
            </a>

          </div>
          <div className="panel-body">
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={ClearRecord}
            >
              <a
                className="fa fa-question-circle-o pull-right m-t-sm fa-lg text-muted"
                href="http://docs.rinocloud.com/rinobot/introduction/clearing_rinobot_records.html"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>


            {dir.isSaved &&
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
                onClick={onSaveConfig}
                disabled={dir.isStarted}
              >
                <span><i className="fa fa-save"></i> Save</span>
              </a>
            }

            {!dir.isSaved &&
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
                disabled
              >
                <span><i className="fa fa-check"></i> Saved</span>
              </a>
            }

            <form className="form form-horizontal">
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
            </form>
          </div>
        </div>

        <div className="m-b text-center">
          {dir.isStarted && !isStarting &&
            <a
              href="#"
              className="btn btn-danger"
              onClick={onStopClick}
            >
              Stop
            </a>
          }

          {dir.isStarted && isStarting &&
            <a
              href="#"
              className="btn btn-default"
              onClick={onStopClick}
              disabled
            >
              Starting <i className="fa fa-spinner fa-spin"></i>
            </a>
          }

          {!dir.isStarted &&
            <a
              href="#"
              className="btn btn-success"
              onClick={onStartClick}
              data-dismiss="alert"
            >
              Start
            </a>
          }

        </div>

        <div className="panel panel-default">
          <div className="panel-heading">
            Activity
            <div className="pull-right">{dir.processedFiles}/{dir.totalFiles} files processed</div>
          </div>
          <div className="panel-body">
            <div className="configForm">
              <div className="row">
                <div className="col-sm-12">
                  <LogScroll history={dir.history} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export { WatchDir }
