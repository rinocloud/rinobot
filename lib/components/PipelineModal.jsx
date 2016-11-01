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
      <Modal
        show={open}
        onHide={onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="row">
              <div className="col-sm-11">
                Setup Tasks
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
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
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={onHide}
          >
            Cancel
          </Button>
          <Button
            onClick={onRun}
          >
            Run
          </Button>
        </Modal.Footer>
      </Modal>

    )
  }
}

export { PipelineModal }
