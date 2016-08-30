import React from 'react'

class MetadataForm extends React.Component {

  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
  }

  handleChange(field) {
    const { object, onChange } = this.props //eslint-disable-line

    return function (e) {
      e.preventDefault()
      const newState = {
        ...object,
        [field]: e.target.value
      }
      onChange(newState)
    }
  }

  handleRemoveClick(e) {
    const { onRemove } = this.props //eslint-disable-line
    e.preventDefault()
    onRemove()
  }

  render() {
    const { object } = this.props //eslint-disable-line
    return (
      <div className="form-group">
        <div className="col-sm-3">
          <input
            type="text"
            placeholder="field name"
            value={object.field || ''}
            className="form-control input-sm"
            onChange={this.handleChange('field')}
          />
        </div>
        <div className="col-sm-3">
          <input
            type="text"
            placeholder="field value"
            value={object.value || ''}
            className="form-control input-sm"
            onChange={this.handleChange('value')}
          />
        </div>
        <div className="col-sm-1">
          <button
            className="metadata-remove-button btn btn-xs btn-danger"
            onClick={this.handleRemoveClick}
          >
            <i className="fa fa-remove"></i>
          </button>
        </div>
      </div>
    )
  }
}

export { MetadataForm }
