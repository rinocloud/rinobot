import React from 'react'

class MetadataForm extends React.Component {

  render() {
    const { field, value } = this.props
    return (
      <div>
        <div className="row row-centered m-l-lg">
          <div className="col-xs-4 col-centered m-l">
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
          <div className="col-xs-4 col-centered">
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
          <div className="col-xs-2 pull-right">
          <a
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
