import React, { PropTypes } from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { Link } from 'react-router'
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
    packagesConfig: PropTypes.object
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
    const { dir, registry, packagesConfig, isStarting } = this.props
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
        <div className="panel panel-default">

          <div className="panel-heading">
            My folder: <strong>{pt.basename(dir.path)}</strong>
            <a
              href="#"
              className="pull-right"
              onClick={(e) => {
                e.preventDefault()
                shell.showItemInFolder(dir.path)
              }}
            >
              Open <i className="fa fa-external-link"></i>
            </a>

            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={ClearRecord}
            >
              <a href="#" className="pull-right m-r" onClick={removeDotRino}>
                Reset history
              </a>
            </OverlayTrigger>

            <a href="#" className="m-r pull-right" onClick={onRemoveDirClick} >
              <span><i className="fa fa-trash"></i> Remove</span>
            </a>
          </div>

          <div className="panel-body config">
            {!isSaved &&
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
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
                className="m-l-sm btn btn-sm btn-default"
                disabled
              >
                <span><i className="fa fa-check"></i> Saved</span>
              </a>
            }

            {formData.pipelines.map((o, index) =>
              <div className="p-l m-t" key={`pipeline-${index}`}>
                <PipelineForm
                  pipeline={o}
                  packagesConfig={packagesConfig}
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
            )}

            <div className="m-t">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  this.addPipeline()
                }}
              >
                + pipeline
              </a>
            </div>

            {formData.metadata.map((o, index) =>
              <div className="p-l m-t" key={`metadata-${index}`}>
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
            )}

            <div className="m-t">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  this.addMetadata()
                }}
              >
                Add metadata
              </a>
            </div>
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
