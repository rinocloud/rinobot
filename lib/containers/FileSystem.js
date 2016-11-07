import React, { PropTypes } from 'react'
import onClickOutside from 'react-onclickoutside'
import { connect } from 'react-redux'

import * as fsActions from '../actions/fs'
import * as formActions from '../actions/form'
import { ChooseFolderBlock } from '../components/ChooseFolderBlock'
import { FileSystemHeading } from '../components/FileSystemHeading'
import { FileSystemActionBar } from '../components/FileSystemActionBar'
import { PipelineForm } from '../components/PipelineForm'
import { Button } from '../components/Button'
import { FileSystemTable } from '../components/FileSystemTable'


class FileSystem extends React.Component {
  static propTypes = {
    fs: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired,
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
    const { dispatch, fs, form, plugins } = this.props

    return (
      <div>
        {!fs.basePath &&
          <ChooseFolderBlock
            onChooseFolder={(paths) => {
              dispatch(fsActions.setBasePath(paths[0]))
              dispatch(formActions.addPipeline())
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
                  dispatch(fsActions.setBasePath(paths[0]))
                  dispatch(formActions.addPipeline())
                }}
              />

              <div className="panel-body">
                <FileSystemActionBar
                  currentPath={fs.currentPath}
                  basePath={fs.basePath}
                  setCurrentPath={(path) => {
                    dispatch(fsActions.setCurrentPath(path))
                  }}
                  rmSelected={() => {
                    dispatch(fsActions.rmSelected())
                  }}
                  modalOpen={this.state.modalOpen}
                  openModal={this.openModal}
                  closeModal={this.closeModal}
                />

                {this.state.modalOpen &&
                  <div className="row">
                    <div className="col-sm-12 m-t">
                      <PipelineForm
                        filematchVisible={false}
                        pipeline={form.pipelines[0]}
                        installedPlugins={plugins.installed}
                        registry={plugins.registry}
                        onChangeMatch={(newFileMatch) =>
                          dispatch(formActions.changePipelineFilematch({ index: 0, newFileMatch }))}
                        onChangeTaskName={(taskIndex, name) =>
                          dispatch(formActions.changePipelineTaskName(
                            { index: 0, taskIndex, name }
                          ))}
                        onChangeTaskArgs={(taskIndex, argName, argValue) =>
                          dispatch(formActions.changePipelineTaskArgs(
                            { index: 0, taskIndex, argName, argValue }
                          ))}
                        onChangeTaskKeep={(taskIndex, args) =>
                          dispatch(formActions.changePipelineTaskKeep(
                            { index: 0, taskIndex, args }
                          ))}
                        onChangeTaskFlow={(taskIndex, args) =>
                          dispatch(formActions.changePipelineTaskFlow(
                            { index: 0, taskIndex, args }
                          ))}
                        onChangeIncomingOnly={args =>
                          dispatch(formActions.changePipelineIncomingOnly({ index: 0, args }))}
                        onAddTask={() =>
                          dispatch(formActions.addPipelineTask({ index: 0 }))}
                        onRemoveTask={(taskIndex) =>
                          dispatch(formActions.removePipelineTask({ index: 0, taskIndex }))}
                        onRemove={() =>
                          dispatch(formActions.removePipeline({ index: 0 }))}
                      />
                    </div>
                  </div>
                }
                {this.state.modalOpen &&
                  <div className="row">
                    <div className="col-sm-2 col-sm-offset-10 p-l-0">
                      <Button
                        onClick={() => {
                          dispatch(fsActions.processSelected())
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        extraClassNames="m-l-sm"
                        onClick={() => {
                          dispatch(fsActions.processSelected())
                        }}
                      >
                        Run
                      </Button>
                    </div>
                  </div>
                }

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
                          dispatch(fsActions.etCurrentPath(path))
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
  fs: state.fs,
  form: state.form,
  plugins: state.plugins,
})

export default connect(mapStateToProps)(onClickOutside(FileSystem))
