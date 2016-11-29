import React, { PropTypes } from 'react'
import _ from 'lodash'
import { ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap'
import { Selection } from './utils/Selection'
import { FileSystemTableItem } from './FileSystemTableItem'

class FileSystemTable extends React.Component {

  static propTypes = {
    items: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onUnselectAll: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    onCtrlSelect: PropTypes.func.isRequired,
    onShiftSelect: PropTypes.func.isRequired,
    onDragSelect: PropTypes.func.isRequired,
    onSelectSortBy: PropTypes.func.isRequired,
    onClickAddMetadata: PropTypes.func.isRequired,
    onClickNotebook: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = { sortedBy: 'Type' }
  }

  sortByType() {
    this.setState({ sortedBy: 'Type' })
  }

  sortByName() {
    this.setState({ sortedBy: 'Name' })
  }

  render() {
    const {
      items,
      onClick,
      onSelect,
      onCtrlSelect,
      onShiftSelect,
      onDragSelect,
      onSelectSortBy,
      onClickAddMetadata,
      onClickNotebook
    } = this.props

    return (
      <div className="fs-table">
        <ButtonToolbar className="m-l-0 m-t m-b">
          <DropdownButton
            bsSize="xs"
            bsStyle="link"
            title={`Sort by ${this.state.sortedBy}`}
            id="dropdown-basic"
          >
            <MenuItem
              eventKey="1"
              onClick={(e) => {
                e.preventDefault()
                this.sortByType()
                onSelectSortBy('Type')
              }}
            >
              Type
            </MenuItem>
            <MenuItem
              eventKey="2"
              onClick={(e) => {
                e.preventDefault()
                this.sortByName()
                onSelectSortBy('Name')
              }}
            >
            Name
            </MenuItem>
          </DropdownButton>
        </ButtonToolbar>

        <Selection
          onSelectionChange={(keys) => {
            const paths = _.map(keys, key => key.replace('tr-path-', ''))
            onDragSelect(paths)
          }}
        >
          {_.map(items, (item, key) =>
            <FileSystemTableItem
              key={`tr-path-${key}`}
              item={item}
              onClick={onClick}
              onSelect={onSelect}
              onCtrlSelect={onCtrlSelect}
              onShiftSelect={onShiftSelect}
              onClickAddMetadata={onClickAddMetadata}
              onClickNotebook={onClickNotebook}
            />
          )}
        </Selection>
      </div>
    )
  }
}

export default { FileSystemTable }
