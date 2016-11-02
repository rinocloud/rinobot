import React, { PropTypes } from 'react'
import { PipelineForm } from './PipelineForm'
import { Modal, Button } from 'react-bootstrap'

class PipelineModal extends React.Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    onRun: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    registry: PropTypes.array,
    installedPlugins: PropTypes.array,
    pipeline: PropTypes.object.isRequired,
    filematchVisible: PropTypes.bool,
    onChangeMatch: PropTypes.func.isRequired,
    onChangeTaskName: PropTypes.func.isRequired,
    onChangeTaskArgs: PropTypes.func.isRequired,
    onChangeTaskKeep: PropTypes.func.isRequired,
    onChangeTaskFlow: PropTypes.func.isRequired,
    onChangeIncomingOnly: PropTypes.func.isRequired,
    onAddTask: PropTypes.func.isRequired,
    onRemoveTask: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,

  }

  render() {
    const { open, onHide, onRun } = this.props

    return (
      <div className="row">
        <div className="col-sm-12">
          {open &&
            <div className="row">
              <div className="col-sm-12 m-t">
                <PipelineForm
                  filematchVisible={false}
                  pipeline={this.props.pipeline}
                  installedPlugins={this.props.installedPlugins}
                  registry={this.props.registry}
                  onChangeMatch={this.props.onChangeMatch}
                  onChangeTaskName={this.props.onChangeTaskName}
                  onChangeTaskArgs={this.props.onChangeTaskArgs}
                  onChangeTaskKeep={this.props.onChangeTaskKeep}
                  onChangeTaskFlow={this.props.onChangeTaskFlow}
                  onChangeIncomingOnly={this.props.onChangeIncomingOnly}
                  onAddTask={this.props.onAddTask}
                  onRemoveTask={this.props.onRemoveTask}
                  onRemove={this.props.onRemove}
                />
              </div>
            </div>
          }
          {open &&
            <div className="row">
              <div className="col-sm-10">
                <a
                  href="#"
                  className="m-l-sm btn btn-sm btn-default pull-right"
                  onClick={(e) => {
                    e.preventDefault()
                    onRun()
                  }}
                >
                  Run
                </a>
              </div>
            </div>
          }
        </div>
      </div>

    )
  }
}

export { PipelineModal }
