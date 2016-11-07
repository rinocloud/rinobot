import React, { PropTypes } from 'react'
import pt from 'path'
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
    </span>
  )
}

TaskProgramForm.propTypes = {
  programName: PropTypes.string.isRequired,
  onChangeArgs: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool
}
