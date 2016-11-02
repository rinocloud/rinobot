import React, { PropTypes } from 'react'
import _ from 'lodash'
import { shell } from 'electron'


const isOSX = process.platform === 'darwin'


export class FileSystemTable extends React.Component {
  static propTypes = {
    items: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const { items, onSelect, onClick } = this.props

    return (
      <table className="table">
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
                  e.preventDefault()
                  onSelect(item.path)
                }}
              >
                <td className="col-sm-10">
                  {item.type === 'folder' &&
                    <i className="fa fa-folder-o m-r-sm" />
                  }
                  {item.type === 'file' &&
                    <i className="fa fa-file-o m-r-sm" />
                  }
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
