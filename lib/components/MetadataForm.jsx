import React from 'react'

class MetadataForm extends React.Component {

  render() {
    const { field, value } = this.props
    return (
      <div className="row">
        <div className="row">
          <div className="col-xs-4">
            <input
              className="form-control"
              placeholder="field"
              value={field || ''}
              onChange={(e) => {
                e.preventDefault()
                this.props.onChangeField(e.target.value)
              }}
            />
          </div>
          <div className="col-xs-4">
            <input
              className="form-control"
              placeholder="value"
              value={value || ''}
              onChange={(e) => {
                e.preventDefault()
                this.props.onChangeValue(e.target.value)
              }}
            />
          </div>
          <a
            href="#"
            className="m-l"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
          >
            <i className="m-l fa fa-lg fa-remove btn-red-x"></i>
          </a>
        </div>
      </div>
    )
  }
}

export { MetadataForm }
