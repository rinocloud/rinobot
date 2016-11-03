import React, { PropTypes } from 'react'
import { remote } from 'electron'
import pt from 'path'

export const TaskProgramForm = (props) => {
  const {
    programName,
    onChangeArgs,
    isDisabled = false,
    value,
  } = props

  return (
    <a
      style={{ height: '36px', borderRadius: '4px' }}
      href="#"
      className="btn btn-default btn-sm"
      onClick={(e) => {
        e.preventDefault()
        const paths = remote.dialog.showOpenDialog({ properties: ['openFile'] })
        if (paths) {
          e.preventDefault()
          onChangeArgs('default', paths[0])
        }
      }}
      disabled={isDisabled}
    >
      Select {programName === 'Rscript' ? 'R' : programName} file
      {value ? ` (${pt.basename(value)})` : ''}
    </a>
  )
}

TaskProgramForm.propTypes = {
  programName: PropTypes.string.isRequired,
  onChangeArgs: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool
}
