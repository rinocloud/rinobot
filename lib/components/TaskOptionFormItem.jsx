import React, { PropTypes } from 'react'
import _ from 'lodash'

import { BoolOption } from './BoolOption'
import { StringOption } from './StringOption'
import { NumberOption } from './NumberOption'
import { SelectOption } from './SelectOption'

export const TaskOptionFormItem = (props) => {
  const {
    // description,
    type, // either string, bool, int or float
    allowed = [], // list of allowed values
    required = false, // true or false
    optionName, // the name of the option
    optionsValue, // the object which holds current options value
    onChangeArgs
  } = props

  const value = optionsValue[optionName] || null

  const selectBoxOptions = _.map(allowed, item => ({ label: item, value: item }))

  if (type === 'string' && allowed.length > 0) {
    return (
      <SelectOption
        name={optionName}
        value={value || ''}
        onChange={(value) => {
          onChangeArgs(optionName, value)
        }}
        options={selectBoxOptions}
        defaultChecked={value}
        isRequired={required}
      />
    )
  }
  if (type === 'string') {
    return (
      <StringOption
        name={optionName}
        value={value || ''}
        onChange={(value) => {
          onChangeArgs(optionName, value)
        }}
        defaultChecked={value}
        isRequired={required}
      />
    )
  }
  if (type === 'int' || type === 'float') {
    return (
      <NumberOption
        name={optionName}
        value={value || ''}
        onChange={(value) => {
          onChangeArgs(optionName, value)
        }}
        defaultChecked={value}
        isRequired={required}
      />
    )
  }
  if (type === 'bool') {
    return (
      <BoolOption
        name={optionName}
        value={value || false}
        onChange={(value) => {
          onChangeArgs(optionName, value)
        }}
        defaultChecked={value}
        isRequired={required}
      />
    )
  }
}


TaskOptionFormItem.propTypes = {
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  allowed: PropTypes.array,
  required: PropTypes.bool,
  optionName: PropTypes.string.isRequired,
  optionsValue: PropTypes.object.isRequired,
  onChangeArgs: PropTypes.func.isRequired
}
