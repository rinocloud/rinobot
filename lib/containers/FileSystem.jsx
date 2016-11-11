import React, { PropTypes } from 'react'
import onClickOutside from 'react-onclickoutside'
import { connect } from 'react-redux'

import * as fsActions from '../actions/fs'
import * as pipelinesActions from '../actions/pipelines'
import * as pipelineFormActions from '../actions/pipelineForm'

import { FileSystemActionBar } from '../components/FileSystemActionBar'
import { PipelineActionBar } from '../components/PipelineActionBar'
import { ChooseFolderBlock } from '../components/ChooseFolderBlock'
import { FileSystemHeading } from '../components/FileSystemHeading'
import { FileSystemTable } from '../components/FileSystemTable'
import { PipelineForm } from '../components/PipelineForm'
import { LoadPipeline } from '../components/LoadPipeline'

class FileSystem extends React.Component {
  static propTypes = {
    fs: PropTypes.object.isRequired,
    pipelineForm: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired,
    pipelines: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.state = { modalOpen: false }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fsActions.hydrate())
  }

  handleClickOutside() {
    const { dispatch } = this.props
    dispatch(fsActions.unSelectAll())
  }

  openModal() {
    this.setState({ modalOpen: true })
  }

  closeModal() {
    this.setState({ modalOpen: false })
  }

  render() {
    const { dispatch, fs, pipelineForm, plugins, pipelines } = this.props

    return (
      <div>
        {!fs.basePath &&
          <ChooseFolderBlock
            onChooseFolder={(paths) => {
              dispatch(fsActions.clickSetBasePath(paths[0]))
            }}
          />
        }
        {fs.basePath &&
          <div className="main config">
            <div className="panel panel-primary">
              <FileSystemHeading
                currentPath={fs.currentPath}
                basePath={fs.basePath}
                onClickBreadcrumb={path => {
                  dispatch(fsActions.setCurrentPath(path))
                }}
                onChooseFolder={(paths) => {
                  dispatch(fsActions.clickSetBasePath(paths[0]))
                }}
              />

              <div className="panel-body">
                <FileSystemActionBar
                  currentPath={fs.currentPath}
                  basePath={fs.basePath}
                  modalOpen={this.state.modalOpen}
                  openModal={this.openModal}
                  closeModal={this.closeModal}
                  setCurrentPath={(path) => {
                    dispatch(fsActions.setCurrentPath(path))
                  }}
                  rmSelected={() => {
                    dispatch(fsActions.rmSelected())
                  }}
                  onNewSnippet={(name) => {
                    dispatch(fsActions.newSnippet(name))
                    this.openModal()
                  }}
                />

                <div className="row">
                  <div className="col-sm-12">

                    {this.state.modalOpen &&
                      <div className="row row-task-faux">
                        <div className="col-sm-3 col-sm-offset-7 m-t">
                          <LoadPipeline
                            pipelines={pipelines}
                            onSelect={(pipeline) => {
                              dispatch(pipelineFormActions.setForm(pipeline))
                            }}
                          />
                        </div>
                      </div>
                    }

                    {this.state.modalOpen &&
                      <div className="row">
                        <div className="col-sm-12 m-t-sm">
                          <PipelineForm
                            filematchVisible={false}
                            pipeline={pipelineForm.pipelines[0]}
                            installedPlugins={plugins.installed}
                            registry={plugins.registry}
                            onChangeMatch={(newFileMatch) =>
                              dispatch(pipelineFormActions
                                .changePipelineFilematch({ index: 0, newFileMatch }))}
                            onChangeTaskName={(taskIndex, name) =>
                              dispatch(pipelineFormActions
                                .changePipelineTaskName({ index: 0, taskIndex, name }))}
                            onChangeTaskArgs={(taskIndex, argName, argValue) =>
                              dispatch(pipelineFormActions
                                .changePipelineTaskArgs({ index: 0, taskIndex, argName, argValue }))}
                            onChangeTaskKeep={(taskIndex, args) =>
                              dispatch(pipelineFormActions
                                .changePipelineTaskKeep({ index: 0, taskIndex, args }))}
                            onChangeTaskFlow={(taskIndex, args) =>
                              dispatch(pipelineFormActions
                                .changePipelineTaskFlow({ index: 0, taskIndex, args }))}
                            onChangeIncomingOnly={args =>
                              dispatch(pipelineFormActions
                                .changePipelineIncomingOnly({ index: 0, args }))}
                            onAddTask={() =>
                              dispatch(pipelineFormActions
                                .addPipelineTask({ index: 0 }))}
                            onRemoveTask={(taskIndex) =>
                              dispatch(pipelineFormActions
                                .removePipelineTask({ index: 0, taskIndex }))}
                            onRemove={() =>
                              dispatch(pipelineFormActions
                                .removePipeline({ index: 0 }))}
                          />
                        </div>
                      </div>
                    }
                    {this.state.modalOpen &&
                      <PipelineActionBar
                        onClickRun={() => {
                          dispatch(fsActions.processSelected())
                        }}
                        onSavePipeline={(name) => {
                          dispatch(pipelinesActions.addPipeline(name))
                        }}
                      />
                    }
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    {fs.items &&
                      <FileSystemTable
                        items={fs.items}
                        onSelect={(path) => {
                          dispatch(fsActions.itemSingleSelect(path))
                        }}
                        onCtrlSelect={(path) => {
                          dispatch(fsActions.itemCtrlSelect(path))
                        }}
                        onShiftSelect={(path) => {
                          dispatch(fsActions.itemShiftSelect(path))
                        }}
                        onDragSelect={(paths) => {
                          dispatch(fsActions.itemDragSelect(paths))
                        }}
                        onUnselectAll={() => {
                          dispatch(fsActions.unSelectAll())
                        }}
                        onClick={(path) => {
                          dispatch(fsActions.setCurrentPath(path))
                        }}
                        onSelectSortBy={(sortedBy) => {
                          dispatch(fsActions.setSortedBy(sortedBy))
                        }}
                      />
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  pipelineForm: state.pipelineForm,
  pipelines: state.pipelines,
  plugins: state.plugins,
  fs: state.fs,
})

export default connect(mapStateToProps)(onClickOutside(FileSystem))
