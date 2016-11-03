import React, { PropTypes } from 'react'
import Select from 'react-select-plus'

export const SelectOption = (props) => {
  const {
    name,
    onChange,
    value,
    options,
    isRequired = false
  } = props

  return (
    <Select
      type="text"
      className="option"
      placeholder={`${name} ${isRequired ? '(required)' : ''}`}
      value={value}
      options={options}
      onChange={(item) => {
        onChange(item ? item.value : null)
      }}
    />
  )
}

SelectOption.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  isRequired: PropTypes.bool
}
