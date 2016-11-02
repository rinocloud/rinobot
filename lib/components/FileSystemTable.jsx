import React, { PropTypes } from 'react'
import _ from 'lodash'
import { shell } from 'electron'
import { FileIcon } from './FileIcon'

const isOSX = process.platform === 'darwin'


export class FileSystemTable extends React.Component {
  static propTypes = {
    items: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onUnselectAll: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    onCtrlSelect: PropTypes.func.isRequired,
    onShiftSelect: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.onClickTr = this.onClickTr.bind(this)
  }

  onClickTr(e, item) {
    const { onSelect, onCtrlSelect, onShiftSelect } = this.props
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      onCtrlSelect(item.path)
    } else if (e.shiftKey) {
      onShiftSelect(item.path)
    } else {
      onSelect(item.path)
    }
  }

  render() {
    const { items, onClick, onUnselectAll } = this.props

    return (
      <table
        className="table"
        tabIndex="0"
        onBlur={onUnselectAll}
      >
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {_.map(items, (item, name) => {
            return (
              <tr
                key={`tr-path-${name}`}
                className={item.selected && 'active'}
                onClick={(e) => {
                  this.onClickTr(e, item)
                }}
              >
                <td className="col-sm-10">
                  <FileIcon
                    filename={item.name}
                    type={item.type}
                  />
                  {item.type === 'folder' &&
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onClick(item.path)
                      }}
                    >
                      {item.name}/
                    </a>
                  }
                  {item.type === 'file' &&
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        shell.openItem(item.path)
                      }}
                    >
                      {item.name}
                    </a>
                  }
                </td>

                <td className="col-sm-2">
                  <a
                    href="#"
                    className="btn btn-xs"
                    onClick={(e) => {
                      e.preventDefault()
                      shell.showItemInFolder(item.path)
                    }}
                  >
                    Show in {isOSX ? 'Finder' : 'Explorer'}
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}

export default { FileSystemTable }
