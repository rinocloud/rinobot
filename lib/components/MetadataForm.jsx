import React, { PropTypes } from 'react'
import { Field, FieldArray, reduxForm, propTypes } from 'redux-form'


const renderField = (props) => {
  const { input, label, type, meta: { touched, error } } = props
  return (
    <div>
      <input className="form-control" {...input} type={type} placeholder={label} />
      {touched && error && <span>{error}</span>}
    </div>
  )
}

renderField.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired
}


const renderMetadataField = (props) => {
  const { fields, meta: { dirty, touched, error } } = props

  return (
    <div>
      {fields.map((member, index) =>
        <div className="row m-b-sm" key={index}>
          <div className="col-sm-5">
            <Field label="Field name" name={`${member}.key`} type="text" component={renderField} />
          </div>
          <div className="col-sm-5">
            <Field label="Field value" name={`${member}.value`} type="text" component={renderField} />
          </div>
          <div className="col-sm-2">
            <a
              href="#"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                fields.remove(index)
              }}
            >
              [x]
            </a>
          </div>
        </div>
      )}

      <button type="button" className="btn btn-default" onClick={() => fields.push({})}>
        <i className="fa fa-plus" />
      </button>

      {dirty &&
        <button type="submit" className="btn btn-default m-l-sm">
          <i className="fa fa-save" />
        </button>
      }
      {touched && error && <span>{error}</span>}
    </div>
  )
}

renderMetadataField.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired
}

const MetadataForm = (props) => {
  const { handleSubmit } = props

  return (
    <div className="row">
      <div className="col-sm-12">
        <form className="form-horizontal" onSubmit={handleSubmit}>
          <FieldArray name="metadataArray" component={renderMetadataField} />
        </form>
      </div>
    </div>
  )
}

MetadataForm.propTypes = propTypes

export default {
  MetadataForm: reduxForm({
    form: 'metadataForm',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
  })(MetadataForm)
}
