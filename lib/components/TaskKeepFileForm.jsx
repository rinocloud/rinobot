import React, { PropTypes } from 'react'

export const TaskKeepFileForm = (props) => {
  const {
    onChangeKeep,
    keep
  } = props

  return (
    <div className="text-muted config-checkbox">
      keep file{'  '}
      <input
        type="checkbox"
        onChange={(e) => {
          onChangeKeep(e.target.checked)
        }}
        defaultChecked={keep}
      />
    </div>

  )
}

TaskKeepFileForm.propTypes = {
  keep: PropTypes.bool.isRequired,
  onChangeKeep: PropTypes.func.isRequired
}
