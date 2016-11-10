import React, { PropTypes } from 'react'
import pt from 'path'
import { shell } from 'electron'
import { ChooseFolderButton } from './ChooseFolderButton'

export const TaskProgramForm = (props) => {
  const {
    programName,
    onChangeArgs,
    isDisabled = false,
    value,
  } = props

  return (
    <span>
      <ChooseFolderButton
        onChooseFolder={(paths) => {
          onChangeArgs('default', paths[0])
        }}
        disabled={isDisabled}
        properties={['openFile']}
      >
        Select {programName === 'Rscript' ? 'R' : programName} file

      </ChooseFolderButton>

      <small className="m-l-sm">
        {`${value ? pt.basename(value) : ''}`}
      </small>

      {programName === 'python' &&
        <a
          href="#"
          className="pull-right"
          onClick={(e) => {
            e.preventDefault()
            shell.openExternal('https://docs.rinocloud.com/rinocloud-desktop/running_python.html')
          }}
        >
          More about running <u>{programName}</u> here <i className="fa fa-external-link" />
        </a>
      }

      {programName === 'matlab' &&
        <a
          href="#"
          className="pull-right"
          onClick={(e) => {
            e.preventDefault()
            shell.openExternal('https://docs.rinocloud.com/rinocloud-desktop/running_matlab.html')
          }}
        >More about running <u>{programName}</u> here <i className="fa fa-external-link" />
        </a>
      }

      {programName === 'Rscript' &&
        <a
          href="#"
          className="pull-right"
          onClick={(e) => {
            e.preventDefault()
            shell.openExternal('https://docs.rinocloud.com/rinocloud-desktop/running_r.html')
          }}
        >
          More about running <u>{programName}</u> here <i className="fa fa-external-link" />
        </a>
      }
    </span>
  )
}

TaskProgramForm.propTypes = {
  programName: PropTypes.string.isRequired,
  onChangeArgs: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool
}
