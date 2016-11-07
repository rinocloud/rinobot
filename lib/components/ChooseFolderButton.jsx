import React, { PropTypes } from 'react'
import { Button } from '../components/Button'
import { remote } from 'electron'

export const ChooseFolderButton = (props) => {
  const {
    onChooseFolder,
    children,
    extraClassNames = '',
    properties = ['openDirectory', 'multiSelections']
  } = props

  return (
    <Button
      extraClassNames={extraClassNames}
      onClick={() => {
        const paths = remote.dialog.showOpenDialog({
          properties
        })
        if (paths) {
          onChooseFolder(paths)
        }
      }}
    >
      {children || 'Choose folder'}
    </Button>
  )
}

ChooseFolderButton.propTypes = {
  children: PropTypes.node,
  onChooseFolder: PropTypes.func.isRequired,
  extraClassNames: PropTypes.string,
  properties: PropTypes.array,
}
