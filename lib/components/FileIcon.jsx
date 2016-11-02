import React, { PropTypes } from 'react'
import pt from 'path'

export class FileIcon extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired
  }

  render() {
    const { type, filename } = this.props

    if (type === 'folder') {
      return <i className="fa fa-folder-o m-r" />
    }

    const ext = pt.extname(filename)
    const imageList = ['.png', '.gif', '.jpg', '.jpeg', '.tiff']

    if (type === 'file') {
      if (imageList.includes(ext)) {
        return <i className="fa fa-file-image-o m-r" />
      }

      return <i className="fa fa-file-text-o m-r" />
    }
  }

}

export default { FileIcon }
