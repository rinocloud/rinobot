import React, { PropTypes } from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { shell } from 'electron'
import { PipelineForm } from './PipelineForm'
import { MetadataForm } from './MetadataForm'
import { LogScroll } from './LogScroll'
import pt from 'path'
import update from 'react-addons-update'


const ClearRecord = (
  <Popover
    id="popover-trigger-hover-focus"
  >
    <small>
      This will clear Rinobots logs for this folder, so you can re-run all pipelines.
    </small>
  </Popover>
)

const MetadataOverlay = (
  <Popover
    id="popover-trigger-hover-focus"
  >
    <small>
      You can add information to your data adding metadata, they can also be
      referenced in task arguments.
      Click to learn more.
    </small>
  </Popover>
)


const PipelineOverlay = (
  <Popover
    id="popover-trigger-hover-focus"
  >
    <small>
      This is where you can add a flow of tasks for your file or a specific file you can select.
      Click to learn more.
    </small>
  </Popover>
)


const openExternal = (e) => {
  e.preventDefault()
  shell.openExternal(e.target.href)
}

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
            tasks: []
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
                keep: true
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
                className="text-muted m-r"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  shell.showItemInFolder(dir.path)
                }}
              >
                {pt.basename(dir.path)}/
                <i className="m-l-sm fa fa-external-link"></i>
              </a>

              {!isSaved &&
                <a
                  href="#"
                  className="btn btn-xs btn-default m-r-sm"
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
                  className="btn btn-xs btn-default m-r-sm"
                  disabled
                >
                  <span><i className="fa fa-check"></i> Saved</span>
                </a>
              }

              {dir.isStarted && !isStarting &&
                <a
                  href="#"
                  className="btn btn-xs btn-danger"
                  onClick={onStopClick}
                >
                  <i className="m-r-sm fa fa-stop-circle-o" />
                  Stop
                </a>
              }

              {dir.isStarted && isStarting &&
                <a
                  href="#"
                  className="btn btn-xs btn-default"
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
                  className="btn btn-xs btn-start"
                  style={{ color: '#fff' }}
                  onClick={onStartClick}
                  data-dismiss="alert"
                >
                  Start
                  <i className="m-l-sm fa fa-play-circle-o" />
                </a>
              }

              <OverlayTrigger
                trigger={['hover']}
                placement="bottom"
                overlay={ClearRecord}
              >
                <a
                  href="#"
                  className="pull-right btn btn-xs btn-default btn-red text-muted"
                  onClick={removeDotRino}
                >
                  Reset history
                </a>
              </OverlayTrigger>

              <a
                href="#"
                className="pull-right m-r-sm btn btn-xs btn-default btn-red text-muted"
                onClick={onRemoveDirClick}
              >
                <span><i className="fa fa-trash"></i> Remove</span>
              </a>
            </div>
          </div>
        </div>

        <div className="main config">
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <div className="row m-t m-b">
                <div className="col-sm-4">
                  <h6
                    className="block-title"
                    style={{ color: '#666' }}
                  >
                    Automation Pipeline {'  '}
                    <OverlayTrigger
                      trigger={['hover']}
                      placement="right"
                      overlay={PipelineOverlay}
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

              {formData.pipelines.map((o, index) =>
                <div className="row pipeline" key={`pipeline-${index}`}>
                  <div className="sf_wrapper col-xs-1  col-xs-1-sm">
                    <div
                      className={
                        index === 0 ? 'grey_horz grey_horz_first' : 'grey_horz'
                      }
                    ></div>
                  </div>
                  <div className="col-xs-11">
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

              <a
                href="#"
                className={
                  formData.pipelines.length === 0 ?
                    'btn-add-pipeline m-l'
                  :
                    'btn-add-pipeline'
                }
                onClick={(e) => {
                  e.preventDefault()
                  this.addPipeline()
                }}
              >
                <i className="fa fa-plus-circle m-r-sm" />
                {formData.pipelines.length === 0 && 'Add pipeline'}
              </a>

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

              {formData.pipelines.length !== 0 &&
                <div className="row">
                  <div className="col-sm-12">
                    <a
                      href="#"
                      className="btn-add-metadata"
                      onClick={(e) => {
                        e.preventDefault()
                        this.addMetadata()
                      }}
                    >
                      <i className="fa fa-plus m-t" />{'  '}
                      <small className="">Add metadata</small>
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>


          {dir.isStarted &&
            <div className="row m-a p-l-lg p-r-lg">
              <hr />
            </div>
          }

          {dir.isStarted &&
            <div className="row plugins">
              <div className="col-sm-10 col-sm-offset-1">
                <div className="row m-b">
                  <div className="col-sm-6">
                    <h6 className="block-title" style={{ color: '#666' }}>
                      Activity
                      <span
                        className="text-muted m-l"
                        style={{
                          textTransform: 'lowercase'
                        }}
                      >
                        {dir.processedFiles}/{dir.totalFiles} files processed
                      </span>

                    </h6>
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
