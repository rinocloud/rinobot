import React, { PropTypes } from 'react'
import { ChooseFolderButton } from '../components/ChooseFolderButton'

export const ChooseFolderBlock = (props) => {
  const { onChooseFolder } = props

  return (
    <div className="m-t-lg p-t-lg">
      <div className="text-center" style={{ height: '500px' }}>

        <h2 className="block-title m-t-lg" style={{ height: '20%' }}>
          Rinobot is here to <i className="fa fa-bolt" />supercharge your data!
        </h2>

        <ChooseFolderButton
          onChooseFolder={onChooseFolder}
          extraClassNames="btn-add-folder m-t-sm"
        >
          <i className="fa fa-plus"></i>
          <span>Add a folder to get started</span>
        </ChooseFolderButton>

      </div>
    </div>
  )
}

ChooseFolderBlock.propTypes = {
  onChooseFolder: PropTypes.func.isRequired
}