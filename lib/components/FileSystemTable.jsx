import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'
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
  }
  constructor(props) {
    super(props)
    this.state = { sortedBy: 'Filetype' }
  }

  sortByFiletype() {
    this.setState({ sortedBy: 'Filetype' })
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
    } = this.props

    const itemsArray = _.map(items)
    const sortedItemsTable = _.sortBy(itemsArray, [(item) => {
      if (this.state.sortedBy === 'Filetype') {
        return pt.extname(item.name)
      }
      if (this.state.sortedBy === 'Name') {
        return item.name
      }
    }])

    return (
      <table className="table">
        <thead>
          <tr>
            <th>
              <ButtonToolbar>
                <DropdownButton
                  bsSize="small"
                  title={<span>
                    <small>Sort By</small> <strong><u>{this.state.sortedBy}</u></strong>
                  </span>}
                  id="dropdown-size-extra-small"
                >
                  <MenuItem
                    eventKey="1"
                    onClick={(e) => {
                      e.preventDefault()
                      this.sortByFiletype()
                    }}
                  >
                    Filetype
                  </MenuItem>
                  <MenuItem
                    eventKey="2"
                    onClick={(e) => {
                      e.preventDefault()
                      this.sortByName()
                    }}
                  >
                  Name
                  </MenuItem>
                  <MenuItem eventKey="3">Others</MenuItem>
                </DropdownButton>
              </ButtonToolbar>
            </th>
            <th></th>
          </tr>
        </thead>
        <Selection
          onSelectionChange={(keys) => {
            const paths = _.map(keys, key => key.replace('tr-path-', ''))
            onDragSelect(paths)
          }}
        >
          {_.map(sortedItemsTable, (item, index) =>
            <FileSystemTableItem
              key={`tr-path-${index}`}
              item={item}
              onClick={onClick}
              onSelect={onSelect}
              onCtrlSelect={onCtrlSelect}
              onShiftSelect={onShiftSelect}
            />
          )}
        </Selection>
      </table>
    )
  }
}

export default { FileSystemTable }
