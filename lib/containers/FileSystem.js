import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
const { dialog } = require('electron').remote

import * as fsActions from '../actions/fs'
import * as formActions from '../actions/form'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PipelineModal } from '../components/PipelineModal'


export class FileSystem extends React.Component {
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
    this.state = { modalOpen: false }
  }

  componentDidMount() {
    setInterval(() => {
      const { dispatch, fs } = this.props
      if (fs.path) {
        dispatch(fsActions.setPath(fs.path))
      }
    }, 500)
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
      const paths = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
      if (paths) {
        dispatch(fsActions.setPath(paths[0]))
        dispatch(formActions.addPipeline())
      }
    }

    return (
      <div>
        {form.pipelines.length !== 0 &&
          <PipelineModal
            open={this.state.modalOpen}
            onRun={() => {
              const files = _.map(_.filter(fs.items, { selected: true, type: 'file' }), 'path')
              dispatch(fsActions.processFiles(files))
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
              dispatch(formActions.removePipelineTask({ index: 0, taskIndex }))
            }
            onRemove={() =>
              dispatch(formActions.removePipeline({ index: 0 }))}
          />
        }

        <div className="header">
          <div className="row">
            <div className="col-sm-12">
              <strong className="m-r header-link">
                File system
              </strong>
            </div>
          </div>
        </div>

        <div className="main config p-l p-r">
          <div className="row">
            <div className="col-sm-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <div className="row">
                    <div className="col-sm-10">
                      {fs.path && <Breadcrumbs
                        path={fs.path}
                        onClick={path => {
                          dispatch(fsActions.setPath(path))
                        }}
                      />}
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
                      this.openModal()
                    }}
                  >
                    Run Task
                  </a>
                  <div className="row">
                    <div className="col-sm-12">
                      {fs.path && <table className="table">
                        <thead>
                          <tr>
                            <th>
                              Name
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {_.map(fs.items, (item, name) => {
                            return (
                              <tr key={`tr-path-${name}`} className={item.selected && 'active'}>
                                <td
                                  onClick={(e) => {
                                    e.preventDefault()
                                    dispatch(fsActions.toggleItemSelected(item.name))
                                  }}
                                >
                                  {item.type === 'folder' &&
                                    <a
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        dispatch(fsActions.setPath(item.path))
                                      }}
                                    >
                                      {name}
                                    </a>
                                  }
                                  {item.type === 'file' && item.name}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

const mapStateToProps = (state) => ({
  fs: state.fs,
  form: state.form,
  plugins: state.plugins,
})

export default connect(mapStateToProps)(FileSystem)
