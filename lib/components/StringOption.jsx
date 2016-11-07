import React, { PropTypes } from 'react'

export const StringOption = (props) => {
  const {
    name,
    onChange,
    value,
    isRequired = false
  } = props

  return (
    <input
      type="text"
      placeholder={`${name} ${isRequired ? '(required)' : ''}`}
      value={value}
      className="form-control input-sm option"
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  )
}

StringOption.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  isRequired: PropTypes.bool
}
