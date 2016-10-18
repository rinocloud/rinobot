import React, { PropTypes } from 'react'
import { shell } from 'electron'
import update from 'react-addons-update'
import pt from 'path'
import { PipelineForm } from './PipelineForm'
import { MetadataForm } from './MetadataForm'
import { LogScroll } from './LogScroll'


class WatchDir extends React.Component {
  static propTypes = {
    dir: PropTypes.object.isRequired,
    onStartClick: PropTypes.func.isRequired,
    isStarting: PropTypes.bool.isRequired,
    onStopClick: PropTypes.func.isRequired,
    onRemoveDirClick: PropTypes.func.isRequired,
    onSaveConfig: PropTypes.func.isRequired,
    removeDotRino: PropTypes.func.isRequired,
    registry: PropTypes.array.isRequired,
    installedPlugins: PropTypes.array
  }

  constructor(props) {
    super(props)

    this.onSaveConfig = this.onSaveConfig.bind(this)
    this.addPipeline = this.addPipeline.bind(this)
    this.removePipeline = this.removePipeline.bind(this)
    this.addPipelineTask = this.addPipelineTask.bind(this)
    this.removePipelineTask = this.removePipelineTask.bind(this)
    this.changePipelineMatch = this.changePipelineMatch.bind(this)
    this.changePipelineTaskName = this.changePipelineTaskName.bind(this)
    this.changePipelineTaskArgs = this.changePipelineTaskArgs.bind(this)
    this.changePipelineTaskFlow = this.changePipelineTaskFlow.bind(this)

    this.addMetadata = this.addMetadata.bind(this)
    this.removeMetadata = this.removeMetadata.bind(this)
    this.changeMetadataField = this.changeMetadataField.bind(this)
    this.changeMetadataValue = this.changeMetadataValue.bind(this)

    this.state = {
      formData: props.dir.config,
      isSaved: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ formData: nextProps.dir.config, isSaved: true })
  }

  onSaveConfig() {
    this.props.onSaveConfig(this.state.formData)
    this.setState({ isSaved: true })
  }

  addPipeline() {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          $push: [{
            filematch: null,
            incoming_only: true,
            tasks: [{
              name: null,
              args: null,
              keep: true,
              flow: 'then'
            }]
          }]
        }
      }
    }))
  }

  removePipeline(index) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          $splice: [[index, 1]]
        }
      }
    }))
  }

  addPipelineTask(index) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            tasks: {
              $push: [{
                name: null,
                args: null,
                keep: true,
                flow: 'then'
              }]
            }
          }
        }
      }
    }))
  }

  removePipelineTask(index, taskIndex) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            tasks: {
              $splice: [[taskIndex, 1]]
            }
          }
        }
      }
    }))
  }

  changePipelineMatch(index, newMatch) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            filematch: { $set: newMatch }
          }
        }
      }
    }))
  }

  changePipelineTaskName(index, taskIndex, name) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            tasks: {
              [taskIndex]: {
                name: { $set: name }
              }
            }
          }
        }
      }
    }))
  }

  changePipelineTaskArgs(index, taskIndex, args) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            tasks: {
              [taskIndex]: {
                args: { $set: args }
              }
            }
          }
        }
      }
    }))
  }

  changePipelineTaskKeep(index, taskIndex, args) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            tasks: {
              [taskIndex]: {
                keep: { $set: args }
              }
            }
          }
        }
      }
    }))
  }

  changePipelineTaskFlow(index, taskIndex, args) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            tasks: {
              [taskIndex]: {
                flow: { $set: args }
              }
            }
          }
        }
      }
    }))
  }

  changePipelineIncomingOnly(index, args) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        pipelines: {
          [index]: {
            incoming_only: { $set: args }
          }
        }
      }
    }))
  }

  addMetadata() {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        metadata: {
          $push: [{
            field: null,
            value: null
          }]
        }
      }
    }))
  }

  removeMetadata(index) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        metadata: {
          $splice: [[index, 1]]
        }
      }
    }))
  }

  changeMetadataField(index, field) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        metadata: {
          [index]: {
            field: { $set: field }
          }
        }
      }
    }))
  }

  changeMetadataValue(index, value) {
    this.setState(update(this.state, {
      isSaved: { $set: false },
      formData: {
        metadata: {
          [index]: {
            value: { $set: value }
          }
        }
      }
    }))
  }

  render() {
    const { dir, registry, installedPlugins, isStarting } = this.props
    const { formData, isSaved } = this.state

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

    const removeDotRino = (e) => {
      e.preventDefault()
      if (confirm("All data will be re-processed next time. Are you sure you want to do this?")) { // eslint-disable-line
        this.props.removeDotRino()
      }
    }

    return (
      <div>
        <div className="header">
          <div className="row">
            <div className="col-sm-12">

              <a
                className="m-r header-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  shell.showItemInFolder(dir.path)
                }}
              >
                <strong>
                  {pt.basename(dir.path)}/
                  <i className="m-l-sm fa fa-external-link"></i>
                </strong>
              </a>

              {!isSaved &&
                <a
                  href="#"
                  className="btn btn-sm btn-default m-r-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    this.onSaveConfig()
                  }}
                  disabled={dir.isStarted}
                >
                  <span><i className="fa fa-save"></i> Save</span>
                </a>
              }

              {isSaved &&
                <a
                  href="#"
                  className="btn btn-sm btn-default m-r-sm"
                  disabled
                >
                  <span><i className="fa fa-check"></i> Saved</span>
                </a>
              }

              {dir.isStarted && !isStarting &&
                <a
                  href="#"
                  className="btn btn-sm btn-danger"
                  onClick={onStopClick}
                >
                  <i className="m-r-sm fa fa-stop-circle-o" />
                  Stop watching
                </a>
              }

              {dir.isStarted && isStarting &&
                <a
                  href="#"
                  className="btn btn-sm btn-default"
                  onClick={onStopClick}
                  disabled
                >
                  <i className="m-r-sm fa fa-spinner fa-spin"></i>
                  Starting
                </a>
              }

              {!dir.isStarted &&
                <a
                  href="#"
                  className="btn btn-sm btn-start"
                  style={{ color: '#fff' }}
                  onClick={onStartClick}
                >
                  Start watching
                  <i className="m-l-sm fa fa-play-circle-o" />
                </a>
              }

              <a
                href="#"
                className="btn btn-sm btn-default m-l-sm pull-right"
                onClick={removeDotRino}
              >
                <span><i className="fa fa-eye-slash"></i> Reset</span>
              </a>

              <a
                href="#"
                className="btn btn-sm btn-default m-l-sm pull-right"
                onClick={onRemoveDirClick}
              >
                <span><i className="fa fa-trash"></i> Remove folder</span>
              </a>
            </div>
          </div>
        </div>

        <div className="main config p-l p-r">
          <div className="row">

            <div className="col-sm-12">

              {formData.pipelines.length === 0 &&
                <div className="block text-center">
                  <div className="m-t-lg">
                    <i className="fa fa-bolt fa-2x" />
                    <div className="slash" />
                    <div className="m-b-sm"> No automation pipelines.</div>
                    <a
                      href="#"
                      className="btn btn-sm btn-default"
                      onClick={(e) => {
                        e.preventDefault()
                        this.addPipeline()
                      }}
                    >
                      <i className="fa fa-bolt m-r-sm" />
                      Add a Pipeline
                    </a>
                  </div>
                </div>
              }

              {formData.pipelines.length !== 0 &&
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <div className="row">
                      <div className="col-sm-4">
                        <div className="panel-title m-t-sm">
                          Automation Pipelines
                        </div>
                      </div>
                      <div className="col-sm-8">
                      {formData.pipelines.length !== 0 &&
                        <a
                          href="#"
                          className="m-l-sm btn btn-sm btn-default pull-right"
                          onClick={(e) => {
                            e.preventDefault()
                            this.addMetadata()
                          }}
                        >
                          <i className="fa fa-plus-circle m-r-sm" />
                          Add Metadata
                        </a>
                      }
                        <a
                          href="#"
                          className="btn btn-sm btn-add-pipeline pull-right"
                          onClick={(e) => {
                            e.preventDefault()
                            this.addPipeline()
                          }}
                        >
                          <i className="fa fa-bolt m-r-sm" />
                          New Pipeline
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="panel-body">
                    {formData.pipelines.map((o, index) =>
                      <div className="row pipeline m-b-lg m-t" key={`pipeline-${index}`}>
                        <div className="col-xs-12">
                          <PipelineForm
                            pipeline={o}
                            installedPlugins={installedPlugins}
                            registry={registry}
                            onChangeMatch={(match) =>
                              this.changePipelineMatch(index, match)}
                            onChangeTaskName={(taskIndex, name) =>
                              this.changePipelineTaskName(index, taskIndex, name)}
                            onChangeTaskArgs={(taskIndex, args) =>
                              this.changePipelineTaskArgs(index, taskIndex, args)}
                            onChangeTaskKeep={(taskIndex, args) =>
                              this.changePipelineTaskKeep(index, taskIndex, args)}
                            onChangeTaskFlow={(taskIndex, args) =>
                              this.changePipelineTaskFlow(index, taskIndex, args)}
                            onChangeIncomingOnly={args =>
                              this.changePipelineIncomingOnly(index, args)}
                            onAddTask={() =>
                              this.addPipelineTask(index)}
                            onRemoveTask={(taskIndex) =>
                              this.removePipelineTask(index, taskIndex)}
                            onRemove={() => this.removePipeline(index)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              }


              {formData.metadata.map((o, index) =>
                <div className="row m-t" key={`metadata-${index}`}>
                  <div className="col-xs-1 col-xs-1-sm col-xs-11" />
                  <div className="col-xs-11">
                    <MetadataForm
                      field={o.field}
                      value={o.value}
                      onChangeField={(field) =>
                        this.changeMetadataField(index, field)}
                      onChangeValue={(value) =>
                        this.changeMetadataValue(index, value)}
                      onRemove={() => this.removeMetadata(index)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {dir.isStarted &&
            <div className="row plugins m-b-lg m-t">
              <div className="col-sm-12 col-sm-offset-">
                <div className="row m-b">
                  <div className="col-sm-6">
                    <strong>
                      Activity
                      <span
                        className="text-muted m-l"
                        style={{
                          textTransform: 'lowercase'
                        }}
                      >
                        {dir.processedFiles}/{dir.totalFiles} files processed
                      </span>

                    </strong>
                  </div>
                </div>

                <LogScroll history={dir.history} />
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export { WatchDir }
