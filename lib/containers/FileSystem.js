import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { remote } from 'electron'
import pt from 'path'
import * as fsActions from '../actions/fs'
import * as formActions from '../actions/form'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PipelineModal } from '../components/PipelineModal'
import { FileSystemTable } from '../components/FileSystemTable'
import onClickOutside from 'react-onclickoutside'

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

  handleClickOutside(e) {
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

    const chooseFolder = (e) => {
      e.preventDefault()
      const paths = remote.dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections']
      })
      if (paths) {
        dispatch(fsActions.setBasePath(paths[0]))
        dispatch(formActions.addPipeline())
      }
    }

    return (
      <div>

        {!fs.basePath &&
          <div className="m-t-lg p-t-lg">
            <div className="text-center" style={{ height: '500px' }}>
              <h2 className="block-title m-t-lg" style={{ height: '20%' }}>
                Rinobot is here to <i className="fa fa-bolt" />supercharge your data!
              </h2>
              <a
                href="#"
                className="btn btn-add-folder m-t-sm"
                onClick={chooseFolder}
              >
                <i className="fa fa-plus"></i>
                <span>Add a folder to get started</span>
              </a>
            </div>
          </div>
        }

        {fs.basePath &&
          <div className="main config">
            <div className="row">
              <div className="col-sm-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <div className="row">
                      <div className="col-sm-10">
                        {fs.currentPath &&
                          <Breadcrumbs
                            basePath={fs.basePath}
                            path={fs.currentPath}
                            onClick={path => {
                              dispatch(fsActions.setCurrentPath(path))
                            }}
                          />
                        }
                      </div>
                      <div className="col-sm-2">
                        <a
                          href="#"
                          className="m-l-sm btn btn-sm btn-default pull-right"
                          onClick={chooseFolder}
                        >
                          Choose folder
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="panel-body">
                    <a
                      href="#"
                      className="m-l-sm btn btn-sm btn-default"
                      onClick={(e) => {
                        e.preventDefault()
                        if (fs.currentPath !== fs.basePath) {
                          dispatch(fsActions.setCurrentPath(pt.dirname(fs.currentPath)))
                        }
                      }}
                      disabled={fs.currentPath === fs.basePath}
                    >
                      <i className="fa fa-arrow-left" />{' '}
                      Back
                    </a>
                    <a
                      href="#"
                      className="m-l-sm btn btn-sm btn-default"
                      onClick={(e) => {
                        e.preventDefault()
                        dispatch(fsActions.rmSelected())
                      }}
                    >
                      <i className="fa fa-times m-r-sm" />
                      Delete
                    </a>
                    <a
                      href="#"
                      className="m-l-sm btn btn-sm btn-default"
                      onClick={(e) => {
                        e.preventDefault()
                        if (!this.state.modalOpen) this.openModal()
                        else this.closeModal()
                      }}
                    >
                      Run Task
                      {this.state.modalOpen &&
                        <i className="fa fa-caret-down m-l-sm" />
                      }
                      {!this.state.modalOpen &&
                        <i className="fa fa-caret-right m-l-sm" />
                      }
                    </a>

                    <PipelineModal
                      open={this.state.modalOpen}
                      onRun={() => {
                        dispatch(fsActions.processSelected())
                      }}
                      onHide={this.closeModal}
                      pipeline={form.pipelines[0]}
                      installedPlugins={plugins.installed}
                      registry={plugins.registry}
                      onChangeMatch={(newFileMatch) =>
                        dispatch(formActions.changePipelineFilematch({ index: 0, newFileMatch }))}
                      onChangeTaskName={(taskIndex, name) =>
                        dispatch(formActions.changePipelineTaskName({ index: 0, taskIndex, name }))} // eslint-disable-line
                      onChangeTaskArgs={(taskIndex, argName, argValue) =>
                        dispatch(formActions.changePipelineTaskArgs({ index: 0, taskIndex, argName, argValue }))} // eslint-disable-line
                      onChangeTaskKeep={(taskIndex, args) =>
                        dispatch(formActions.changePipelineTaskKeep({ index: 0, taskIndex, args }))} // eslint-disable-line
                      onChangeTaskFlow={(taskIndex, args) =>
                        dispatch(formActions.changePipelineTaskFlow({ index: 0, taskIndex, args }))} // eslint-disable-line
                      onChangeIncomingOnly={args =>
                        dispatch(formActions.changePipelineIncomingOnly({ index: 0, args }))}
                      onAddTask={() =>
                        dispatch(formActions.addPipelineTask({ index: 0 }))}
                      onRemoveTask={(taskIndex) =>
                        dispatch(formActions.removePipelineTask({ index: 0, taskIndex }))}
                      onRemove={() =>
                        dispatch(formActions.removePipeline({ index: 0 }))}
                    />

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
                          />
                        }
                      </div>
                    </div>
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
