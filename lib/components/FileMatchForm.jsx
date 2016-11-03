import React, { PropTypes } from 'react'

export const FileMatchForm = (props) => {
  const {
    show = false,
    isDisabled = false,
    value,
    onChange,
    onRemove
  } = props

  if (!show) return <div></div>

  return (
    <div className="row row-task">
      <div className="sf_wrapper_task">
        <div className="grey_horz_task grey_horz_task-faux"></div>
      </div>
      <div className="col-xs-11 m-b">
        <div className="row">
          <div className="col-xs-12">
            <div className="row">
              <div className="col-xs-4">
                <input
                  className="form-control m-b-sm"
                  placeholder="Files to automate..."
                  value={value}
                  onChange={(e) => {
                    e.preventDefault()
                    onChange(e.target.value)
                  }}
                  disabled={isDisabled}
                />
              </div>
              <div className="col-xs-2 col-xs-offset-6">
                <a
                  className="btn btn-sm pull-right"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (!isDisabled) {
                      onRemove()
                    }
                  }}
                  disabled={isDisabled}
                >
                  <i className="fa fa-times-circle-o m-r-sm" />
                  Delete pipeline
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="row-flow-toggle">
          <div className="toggle toggle-faux btn-group btn-group-xs m-t-sm m-b-sm">
            <a
              className="btn-flow active"
            >
              THEN
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

FileMatchForm.propTypes = {
  show: PropTypes.bool,
  isDisabled: PropTypes.bool,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
}
