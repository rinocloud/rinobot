import React, { PropTypes } from 'react'
import { TaskForm } from './TaskForm'
import { TaskRow } from './TaskRow'
import _ from 'lodash'

export const TaskFormList = (props) => {
  const {
    tasks,
    isDisabled = false,
    registry,
    installedPlugins,
    onChangeTaskFlow,
    onChangeTaskName,
    onChangeTaskArgs,
    onChangeTaskKeep,
    onRemoveTask
  } = props

  return (
    <div>
      {_.map(tasks, (task, index) =>
        <TaskRow
          key={`task-${index}`}
          index={index}
          tasks={tasks}
          onChangeTaskFlow={onChangeTaskFlow}
          isDisabled={isDisabled}
        >
          <div className="row">
            <div className="col-xs-12">
              <TaskForm
                isDisabled={isDisabled}
                registry={registry}
                installedPlugins={installedPlugins}
                name={task.name}
                args={task.args}
                keep={task.keep}
                showRemove={index !== 0}
                onChangeName={name => { onChangeTaskName(index, name) }}
                onChangeArgs={(argName, argValue) =>
                  onChangeTaskArgs(index, argName, argValue)}
                onChangeKeep={args => { onChangeTaskKeep(index, args) }}
                onRemove={() => { onRemoveTask(index) }}
              />
            </div>
          </div>
        </TaskRow>
      )}
    </div>
  )
}


TaskFormList.propTypes = {
  tasks: PropTypes.array.isRequired,
  isDisabled: PropTypes.bool,
  registry: PropTypes.array.isRequired,
  installedPlugins: PropTypes.array.isRequired,
  onChangeTaskFlow: PropTypes.func.isRequired,
  onChangeTaskName: PropTypes.func.isRequired,
  onChangeTaskArgs: PropTypes.func.isRequired,
  onChangeTaskKeep: PropTypes.func.isRequired,
  onRemoveTask: PropTypes.func.isRequired,
}
