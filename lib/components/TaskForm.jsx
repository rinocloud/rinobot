import React, { PropTypes } from 'react'
import _ from 'lodash'
import { Button } from './Button'
import { TaskNameForm } from './TaskNameForm'
import { TaskFolderForm } from './TaskFolderForm'
import { TaskProgramForm } from './TaskProgramForm'
import { TaskKeepFileForm } from './TaskKeepFileForm'
import { UploadArgForm } from './UploadArgForm'
import { TaskOptionForm } from './TaskOptionForm'
import { TaskPopover } from './TaskPopover'

export const TaskForm = (props) => {
  const {
    name,
    args,
    keep,
    installedPlugins,
    isDisabled,
    showRemove,
    onRemove,
    onChangeName,
    onChangeArgs,
    onChangeKeep
   } = props

  const commandIsChosen = name || ''
  const commandIsPlugin = _.map(installedPlugins, 'name').includes(name)
  const currentPlugin = _.find(installedPlugins, { name: commandIsChosen })

  return (
    <div className="row">
      <div className="col-xs-12">
        <div className="row task-name-row">
          <div className={`${commandIsPlugin ? 'col-xs-9' : 'col-xs-10'} m-b-sm`}>
            <TaskNameForm
              commandIsChosen={name || ''}
              installedPlugins={installedPlugins}
              value={name || ''}
              onChangeName={onChangeName}
              isDisabled={isDisabled}
            />
          </div>

          {commandIsPlugin &&
            <div className="col-xs-1">
              <TaskPopover currentPlugin={currentPlugin} />
            </div>
          }

          <div className="col-xs-1">
            {commandIsChosen && commandIsPlugin &&
              <TaskKeepFileForm
                keep={keep}
                onChangeKeep={onChangeKeep}
              />
            }
          </div>
          <div className="col-xs-1">
            {showRemove &&
              <Button className="btn-remove-task" onClick={onRemove} disabled={isDisabled}>
                <i className="fa fa-remove btn-red-x"></i>
              </Button>
            }
          </div>
        </div>

        <div className="row task-args-row">
          <div className="col-xs-10">
            {commandIsChosen && commandIsPlugin &&
              <TaskOptionForm
                currentPlugin={currentPlugin}
                optionsValue={args}
                onChangeArgs={onChangeArgs}
              />
            }
            {commandIsChosen && name === 'upload' &&
              <UploadArgForm
                value={args.default || ''}
                onChangeArgs={onChangeArgs}
                isDisabled={isDisabled}
              />
            }
            {commandIsChosen && ['copy', 'move'].includes(name) &&
              <TaskFolderForm
                value={args.default || ''}
                onChangeArgs={onChangeArgs}
                isDisabled={isDisabled}
              />
            }
            {commandIsChosen && ['python', 'Rscript', 'matlab'].includes(name) &&
              <TaskProgramForm
                programName={name}
                onChangeArgs={onChangeArgs}
                value={args.default || ''}
                isDisabled={isDisabled}
              />
            }
          </div>
        </div>
      </div>
    </div>
  )
}


TaskForm.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  registry: PropTypes.array,
  installedPlugins: PropTypes.array,
  name: PropTypes.string,
  keep: PropTypes.bool,
  args: PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.string,
    React.PropTypes.array,
  ]),
  onChangeName: PropTypes.func.isRequired,
  onChangeArgs: PropTypes.func.isRequired,
  onChangeKeep: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  showRemove: PropTypes.bool.isRequired,
}
