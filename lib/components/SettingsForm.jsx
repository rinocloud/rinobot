import React from 'react'
import { Field, reduxForm, propTypes } from 'redux-form'

const SettingsForm = (props) => {
  const { handleSubmit, dirty } = props

  return (
    <form className="form-horizontal" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="col-sm-2 control-label">Path to Python folder</label>
        <div className="col-sm-4">
          <Field name="pythonRoot" component="input" type="text" className="form-control" />
        </div>
      </div>
      <div className="form-group">
        <label className="col-sm-2 control-label">Path to MATLAB folder</label>
        <div className="col-sm-4">
          <Field name="matlabRoot" component="input" type="text" className="form-control" />
        </div>
      </div>
      <div className="form-group">
        <div className="col-sm-offset-2 col-sm-10">
          <button type="submit" className="btn btn-default">
            {dirty &&
              <span>
                <i className="fa fa fa-save m-r-sm" />
                Save
              </span>
            }
            {!dirty && 'Saved'}
          </button>
        </div>
      </div>
    </form>
  )
}

SettingsForm.propTypes = propTypes

export default {
  SettingsForm: reduxForm({
    form: 'settingsForm',
    enableReinitialize: true
  })(SettingsForm)
}
