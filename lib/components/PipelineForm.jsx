import React, { PropTypes } from 'react'
import { TaskFormList } from './TaskFormList'
import { FileMatchForm } from './FileMatchForm'
import { Button } from '../components/Button'

class PipelineForm extends React.Component {

  static propTypes = {
    registry: PropTypes.array,
    installedPlugins: PropTypes.array,
    pipeline: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool,
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
    const {
      pipeline,
      registry,
      installedPlugins,
      isDisabled = false,
      filematchVisible = true,
      onChangeMatch,
      onChangeTaskName,
      onChangeTaskArgs,
      onChangeTaskKeep,
      onChangeTaskFlow,
      onRemove,
      onRemoveTask
     } = this.props

    return (
      <div className="row config">
        <div className="col-xs-12">

          <FileMatchForm
            show={filematchVisible}
            isDisabled={isDisabled}
            value={pipeline.filematch || ''}
            onChange={onChangeMatch}
            onRemove={onRemove}
          />

          <TaskFormList
            tasks={pipeline.tasks}
            isDisabled={isDisabled}
            registry={registry}
            installedPlugins={installedPlugins}
            onChangeTaskFlow={onChangeTaskFlow}
            onChangeTaskName={onChangeTaskName}
            onChangeTaskArgs={onChangeTaskArgs}
            onChangeTaskKeep={onChangeTaskKeep}
            onRemoveTask={onRemoveTask}
          />

          <div className="row">
            <Button
              className="btn-add-task"
              onClick={() => {
                if (!isDisabled) {
                  this.props.onAddTask()
                }
              }}
              disabled={isDisabled}
            >
              <i className="fa fa-plus-circle" />
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export { PipelineForm }
