import React, { PropTypes } from 'react'
import { remote } from 'electron'

export const TaskFolderForm = (props) => {
  const {
    onChangeArgs,
    isDisabled = false,
    value, // args.default || ''
  } = props

  return (
    <div className="form-group m-b-0">
      <div className="input-group">
        <span
          style={{ height: '36px', borderRadius: '4px', lineHeight: '36px' }}
          className="input-group-addon"
          style={{ backgroundColor: 'white' }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              const paths = remote.dialog.showOpenDialog({
                properties: ['openDirectory']
              })
              if (paths) {
                onChangeArgs('default', paths[0])
              }
            }}
            disabled={isDisabled}
          >
            Select folder
          </a>
        </span>
        <input
          style={{ height: '36px', borderRadius: '4px' }}
          type="text"
          value={value}
          className="form-control"
          onChange={(e) => {
            e.preventDefault()
            onChangeArgs('default', e.target.value)
          }}
          placeholder="or type a location"
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}

TaskFolderForm.propTypes = {
  onChangeArgs: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  value: PropTypes.string.isRequired
}
