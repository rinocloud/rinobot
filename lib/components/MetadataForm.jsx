import React from 'react'

class MetadataForm extends React.Component {

  render() {
    const { field, value } = this.props
    return (
      <div className="row">
        <div className="col-xs-12 m-t-sm">
          <div className="row">
            <div className="col-xs-4">
              <input
                style={{ borderRadius: '4px' }}
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
                style={{ borderRadius: '4px' }}
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
                className="position-x-meta"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  this.props.onRemove()
                }}
              >
                <i className="fa fa-lg fa-remove btn-red-x"></i>
              </a>
          </div>
        </div>
      </div>
    )
  }
}

export { MetadataForm }
