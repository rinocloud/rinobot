import React, { PropTypes } from 'react'
import _ from 'lodash'
import { Selection } from './utils/Selection'
import { FileSystemTableItem } from './FileSystemTableItem'


export const FileSystemTable = (props) => {
  const {
    items,
    onClick,
    onSelect,
    onCtrlSelect,
    onShiftSelect,
    onDragSelect
  } = props

  return (
    <div className="m-t">
      <Selection
        onSelectionChange={(keys) => {
          const paths = _.map(keys, key => key.replace('tr-path-', ''))
          onDragSelect(paths)
        }}
      >
        {_.map(items, (item, name) =>
          <FileSystemTableItem
            key={`tr-path-${name}`}
            item={item}
            onClick={onClick}
            onSelect={onSelect}
            onCtrlSelect={onCtrlSelect}
            onShiftSelect={onShiftSelect}
          />
        )}
      </Selection>
    </div>
  )
}


FileSystemTable.propTypes = {
  items: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onUnselectAll: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onCtrlSelect: PropTypes.func.isRequired,
  onShiftSelect: PropTypes.func.isRequired,
  onDragSelect: PropTypes.func.isRequired
}
