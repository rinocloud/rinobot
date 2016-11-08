import React, { PropTypes } from 'react'
import { shell } from 'electron'
import { FileIcon } from './FileIcon'
const isOSX = process.platform === 'darwin'


export class FileSystemTableItem extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onCtrlSelect: PropTypes.func.isRequired,
    onShiftSelect: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.onClickTr = this.onClickTr.bind(this)

    this.state = { logOpen: false }
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
    const {
      item,
      onClick,
    } = this.props

    return (
      <div
        className={`row fs-row ${item.selected && 'active'}`}
        onClick={(e) => {
          this.onClickTr(e, item)
        }}
      >
        <div className="col-sm-8">
          <FileIcon
            filename={item.name}
            type={item.type}
            state={item.state}
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
              onDoubleClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                shell.openItem(item.path)
              }}
            >
              {item.name}
            </a>
          }

          {item.log && this.state.logOpen &&
            <pre className="item-log">
              {item.log}
            </pre>
          }
        </div>

        <div className="col-sm-4">
          <a
            href="#"
            className="btn btn-xs pull-right"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              shell.showItemInFolder(item.path)
            }}
          >
            Show in {isOSX ? 'Finder' : 'Explorer'}
          </a>

          {item.log &&
            <a
              href="#"
              className="btn btn-xs m-r-sm pull-right"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                this.setState({ logOpen: !this.state.logOpen })
              }}
            >
              {this.state.logOpen && <i className="fa fa-caret-down m-r-sm" />}
              {!this.state.logOpen && <i className="fa fa-caret-right m-r-sm" />}
              Show output
            </a>
          }
        </div>
      </div>
    )
  }
}
