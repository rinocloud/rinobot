import React, { PropTypes } from 'react'
import { Button } from '../components/Button'
import pt from 'path'

export const FileSystemActionBar = (props) => {
  const {
    currentPath,
    basePath,
    setCurrentPath,
    rmSelected,
    modalOpen,
    openModal,
    closeModal
  } = props

  return (
    <div>
      <Button
        extraClassNames="m-l-sm"
        onClick={() => {
          if (currentPath !== basePath) {
            setCurrentPath(pt.dirname(currentPath))
          }
        }}
        disabled={currentPath === basePath}
      >
        <i className="fa fa-arrow-left" />{' '}
        Back
      </Button>

      <Button
        extraClassNames="m-l-sm"
        onClick={rmSelected}
      >
        <i className="fa fa-times m-r-sm" />
        Delete
      </Button>

      <Button
        extraClassNames="m-l-sm"
        onClick={() => {
          if (!modalOpen) openModal()
          else closeModal()
        }}
      >
        Run Task
        {modalOpen &&
          <i className="fa fa-caret-down m-l-sm" />
        }
        {!modalOpen &&
          <i className="fa fa-caret-right m-l-sm" />
        }
      </Button>
    </div>
  )
}

FileSystemActionBar.propTypes = {
  currentPath: PropTypes.string.isRequired,
  basePath: PropTypes.string.isRequired,
  setCurrentPath: PropTypes.func.isRequired,
  rmSelected: PropTypes.func.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
}
