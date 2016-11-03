import React, { PropTypes } from 'react'


export const UploadArgForm = (props) =>
  <input
    style={{ height: '36px', borderRadius: '4px' }}
    placeholder="target folder in rinocloud"
    type="text"
    value={props.value}
    className="form-control input-sm"
    onChange={(e) => {
      e.preventDefault()
      this.props.onChangeArgs('default', e.target.value)
    }}
    disabled={props.isDisabled || false}
  />

UploadArgForm.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeArgs: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool
};
