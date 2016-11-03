import React, { PropTypes } from 'react'
import { Button } from '../components/Button'
import { remote } from 'electron'

export const ChooseFolderButton = (props) => {
  const {
    onChooseFolder,
    children,
    extraClassNames = ''
  } = props

  return (
    <Button
      extraClassNames={extraClassNames}
      onClick={() => {
        const paths = remote.dialog.showOpenDialog({
          properties: ['openDirectory', 'multiSelections']
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
}
