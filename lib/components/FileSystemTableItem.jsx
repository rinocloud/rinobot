import React, { PropTypes } from 'react'
import { shell } from 'electron'
import pt from 'path'
import { FileIcon } from './FileIcon'
const isOSX = process.platform === 'darwin'

const formatBytes = (bytes, decimals) => {
  if (bytes === 0) return '0 Byte'
  const k = 1000; // or 1024 for binary
  const dm = decimals + 1 || 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export class FileSystemTableItem extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onCtrlSelect: PropTypes.func.isRequired,
    onShiftSelect: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onClickAddMetadata: PropTypes.func.isRequired,
    onClickNotebook: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.onClickTr = this.onClickTr.bind(this)
    this.state = { logOpen: false }
  }

  onDoubleClick(e, item) {
    e.preventDefault()
    e.stopPropagation()
    shell.openItem(item.path)
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
      onClickAddMetadata,
      onClickNotebook
    } = this.props

    return (
      <div
        className={`row fs-row ${item.selected && 'active'}`}
        onClick={(e) => {
          this.onClickTr(e, item)
        }}
      >
        <a
          href="#"
          className="btn btn-table-item p-a-sm ignore-react-onclickoutside"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClickAddMetadata(item.path)
          }}
        >
          <i className="fa fa-tag" />
        </a>

        <div className="col-sm-5 p-a-sm">
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
              onDoubleClick={(e) => this.onDoubleClick(e, item)}
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

        <div className="col-sm-2 p-a-sm">
          {formatBytes(item.size)}
        </div>

        <div className="col-sm-4 p-a-sm">
          <a
            href="#"
            className="btn btn-xs pull-right m-l-sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              shell.showItemInFolder(item.path)
            }}
          >
            Show in {isOSX ? 'Finder' : 'Explorer'}
          </a>

          {/*
          {pt.extname(item.path) === '.md' &&
            <a
              href="#"
              className="btn btn-xs m-r-sm pull-right"
              onClick={() => onClickNotebook(item.path)}
            >
              Open notebook
            </a>
          }
          */}

        </div>


          {item.log &&
            <div className="col-sm-3 p-a-sm">
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
            </div>
          }

      </div>
    )
  }
}
