import React, { PropTypes } from 'react'
import { shell } from 'electron'
import Toggle from 'react-toggle'
import pt from 'path'
import _ from 'lodash'
import { UserDropdown } from '../components/UserDropdown'
import { PipelineForm } from './PipelineForm'
import { MetadataForm } from './MetadataForm'
import { LogScroll } from './LogScroll'
import * as formActions from '../actions/form'


class WatchDir extends React.Component {
  static propTypes = {
    dir: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
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
  }

  onSaveConfig() {
    this.props.onSaveConfig(_.omit(this.props.form, 'isSaved'))
  }

  render() {
    const { dir, dispatch, form, registry, installedPlugins, isStarting } = this.props

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

              {!form.isSaved &&
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

              {form.isSaved &&
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
                  onClick={(e) => {
                    e.preventDefault()
                    this.props.onStopClick()
                  }}
                >
                  <i className="m-r-sm fa fa-stop-circle-o" />
                  Stop watching
                </a>
              }

              {dir.isStarted && isStarting &&
                <a
                  href="#"
                  className="btn btn-sm btn-default"
                  onClick={(e) => {
                    e.preventDefault()
                    this.props.onStopClick()
                  }}
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
                  onClick={(e) => {
                    e.preventDefault()
                    this.props.onStartClick()
                  }}
                >
                  Start watching
                  <i className="m-l-sm fa fa-play-circle-o" />
                </a>
              }

              <UserDropdown
                groupClassName="pull-right m-l"
                auth={this.props.auth}
                logout={this.props.logout}
              />

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
                onClick={(e) => {
                  e.preventDefault()
                  this.props.onRemoveDirClick()
                }}
              >
                <span><i className="fa fa-trash"></i> Remove folder</span>
              </a>
            </div>
          </div>
        </div>

        <div className="main config p-l p-r">
          <div className="row">
            <div className="col-sm-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <div className="panel-title">
                    Synchronization
                  </div>
                </div>
                <div className="panel-body">
                  <div className="row">
                    <div className="col-sm-12">
                      Synchronization on
                      <Toggle
                        defaultChecked
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <input
                        className="form-control m-t"
                        placeholder="Target folder on Rinocloud"
                        onChange={(e) => {
                          e.preventDefault()
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel panel-primary">
                <div className="panel-heading">
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="panel-title m-t-sm">
                        Automation Pipelines
                      </div>
                    </div>
                    <div className="col-sm-8">
                    {form.pipelines.length !== 0 &&
                      <a
                        href="#"
                        className="m-l-sm btn btn-sm btn-default pull-right"
                        onClick={(e) => {
                          e.preventDefault()
                          dispatch(formActions.addMetadata())
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
                          dispatch(formActions.addPipeline())
                        }}
                      >
                        <i className="fa fa-bolt m-r-sm" />
                        New Pipeline
                      </a>
                    </div>
                  </div>
                </div>

                <div className="panel-body">
                  {form.pipelines.length === 0 &&
                    <div className="text-center">
                      <div className="m-t">
                        <i className="fa fa-bolt fa-2x" />
                        <div className="slash" />
                        <div>No automation pipelines.</div>
                      </div>
                    </div>
                  }

                  {form.pipelines.map((pipeline, index) =>
                    <div className="row pipeline m-b-lg m-t" key={`pipeline-${index}`}>
                      <div className="col-xs-12">
                        <PipelineForm
                          pipeline={pipeline}
                          installedPlugins={installedPlugins}
                          registry={registry}
                          onChangeMatch={(newFileMatch) =>
                            dispatch(formActions.changePipelineFilematch({ index, newFileMatch }))}
                          onChangeTaskName={(taskIndex, name) =>
                            dispatch(formActions.changePipelineTaskName({ index, taskIndex, name }))} // eslint-disable-line
                          onChangeTaskArgs={(taskIndex, args) =>
                            dispatch(formActions.changePipelineTaskArgs({ index, taskIndex, args }))} // eslint-disable-line
                          onChangeTaskKeep={(taskIndex, args) =>
                            dispatch(formActions.changePipelineTaskKeep({ index, taskIndex, args }))} // eslint-disable-line
                          onChangeTaskFlow={(taskIndex, args) =>
                            dispatch(formActions.changePipelineTaskFlow(index, taskIndex, args))}
                          onChangeIncomingOnly={args =>
                            dispatch(formActions.changePipelineIncomingOnly({ index, args }))}
                          onAddTask={() =>
                            dispatch(formActions.addPipelineTask({ index }))}
                          onRemoveTask={(taskIndex) =>
                            dispatch(formActions.removePipelineTask({ index, taskIndex }))
                          }
                          onRemove={() =>
                            dispatch(formActions.removePipeline({ index }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {form.metadata.map((o, index) =>
                <div className="row m-t" key={`metadata-${index}`}>
                  <div className="col-xs-1 col-xs-1-sm col-xs-11" />
                  <div className="col-xs-11">
                    <MetadataForm
                      field={o.field}
                      value={o.value}
                      onChangeField={(field) =>
                        dispatch(formActions.changeMetadataField({ index, field }))}
                      onChangeValue={(value) =>
                        dispatch(formActions.changeMetadataValue({ index, value }))}
                      onRemove={() => dispatch(formActions.removeMetadata({ index }))}
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
