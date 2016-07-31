import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import { MetadataForm } from './MetadataForm'
import {Tabs, Tab} from 'react-bootstrap'

class ConfigurePipeline extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    installedPackages: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleUploadToChange = this.handleUploadToChange.bind(this)
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

  handleUploadToChange(e) {
    this.setState({
      formData: {
        ...this.state.formData,
        uploadTo: e.target.value
      }
    }, this.handleFormDataChange)
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
          { match: '*', command: null, on: null, args: null, plugin: null }
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
    const { installedPackages } = this.props
    const { formData } = this.state

    return (

      <div className="m-t config">
        <div className="row">
          <div className="col-sm-12">
            <form className="form form-horizontal">
              <Tabs defaultActiveKey={1} id="uncontrolled-tab">
                <Tab eventKey={1} title="Task">

              {/*<div>
                <label className="lead pull-left">upload to</label>
                <div className="form-group">
                  <div className="col-sm-4">
                    <input
                      type="text"
                      value={formData.uploadTo}
                      onChange={this.handleUploadToChange}
                      className="form-control input-sm"
                    />
                  </div>
                </div>
              </div>*/}


                {/*<div className="lead">
                  Tasks*/}
                  <div className="m-t">
                  <button className="m-l btn btn-xs btn-success"
                  onClick={this.handleAddTask}>
                    Add task  <i className="fa fa-plus"></i>
                  </button>
                {/*</div>*/}

                {formData.tasks.map((o, i) =>
                  <div className="p-l m-t" key={`taskdiv${i}`}>
                    <TaskForm
                      key={`task${i}`}
                      task={o}
                      installedPackages={installedPackages}
                      onChange={(obj) => this.handleChangeArrayObject('tasks')(i, obj)}
                      onRemove={() => this.handleRemoveArrayObject('tasks')(i)}
                    />
                    {i !== formData.tasks.length - 1 ? <hr /> : ''}
                  </div>
                )}
              </div>
                </Tab>
                <Tab eventKey={2} title="Metadata">
                  <div className="m-t">
                    {/*<div className="lead">
                      Additional metadata*/}
                      <button className="m-l btn btn-xs btn-success"
                      onClick={this.handleAddMetadata}>
                        Add Metadata  <i className="fa fa-plus"></i>
                      </button>
                    {/*</div>*/}
                {formData.metadata.map((o, i) =>
                  <div className="p-l m-t" key={`metadiv${i}`}>
                    <MetadataForm
                      key={`meta${i}`}
                      object={o}
                      onChange={(obj) => this.handleChangeArrayObject('metadata')(i, obj)}
                      onRemove={() => this.handleRemoveArrayObject('metadata')(i)}
                    />
                  </div>
                )}
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
