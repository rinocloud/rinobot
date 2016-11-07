import React, { PropTypes } from 'react'

export const NumberOption = (props) => {
  const {
    name,
    onChange,
    value,
    isRequired = false
  } = props

  return (
    <input
      type="number"
      placeholder={`${name} ${isRequired ? '(required)' : ''}`}
      value={value}
      className="form-control input-sm option"
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  )
}

NumberOption.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired,
  ]),
  isRequired: PropTypes.bool
}
