import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import { MetadataForm } from './MetadataForm'
import map from 'lodash/map'

export class ConfigurePipeline extends React.Component {

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

    /*
      need to handle the mapping from command to plugin
    */

    let meta = [
      { field: '', value: '' }
    ]

    if (props.dir.config.metadata) {
      meta = map(props.dir.config.metadata, (value, field) => ({ field, value }))
    }

    this.state = {
      formData: {
        ...props.dir.config,
        metadata: meta,
      },
    }
  }

  handleFormDataChange() {
    console.log(this.state.formData)
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

  handleAddTask() {
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

  handleAddMetadata() {
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
      <div className="m-t">
        <div className="row">
          <div className="col-sm-8">
            <form className="form form-horizontal">

              <div className="p-l">
                <div className="form-group">
                  <label className="col-sm-2">upload to</label>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      value={formData.uploadTo}
                      onChange={this.handleUploadToChange}
                      className="form-control input-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-a bordered">
                <div className="lead">
                  Tasks
                  <button className="m-l btn btn-xs btn-default" onClick={this.handleAddTask}>
                    add task
                  </button>
                </div>

                {formData.tasks.map((o, i) =>
                  <TaskForm
                    key={`task${i}`}
                    object={o}
                    installedPackages={installedPackages}
                    onChange={(obj) => this.handleChangeArrayObject('tasks')(i, obj)}
                    onRemove={() => this.handleRemoveArrayObject('tasks')(i)}
                  />
                )}
              </div>

              <div className="p-a bordered m-t">
                <div className="lead">
                  Additional metadata
                  <button className="m-l btn btn-xs btn-default" onClick={this.handleAddMetadata}>
                    add metadata
                  </button>
                </div>

                {formData.metadata.map((o, i) =>
                  <MetadataForm
                    key={`meta${i}`}
                    object={o}
                    onChange={(obj) => this.handleChangeArrayObject('metadata')(i, obj)}
                    onRemove={() => this.handleRemoveArrayObject('metadata')(i)}
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

}
