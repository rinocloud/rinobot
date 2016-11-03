import React, { PropTypes } from 'react'

export const BoolOption = (props) => {
  const {
    name,
    onChange,
    value,
    isRequired = false
  } = props

  return (
    <label className="option">
      {`${name} ${isRequired ? '(required)' : ''}`}
      <input
        type="checkbox"
        onChange={(e) => {
          e.preventDefault()
          onChange(e.target.checked)
        }}
        defaultChecked={value}
      />
    </label>
  )
}

BoolOption.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.bool.isRequired,
  isRequired: PropTypes.bool
}
