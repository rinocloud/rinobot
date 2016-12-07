import React, { PropTypes } from 'react'
import pt from 'path'
import { Button } from './Button'
import { Prompt } from './Prompt'
import { DeleteModal } from './DeleteModal'
import { Popover } from './Popover'

class FileSystemActionBar extends React.Component {

  static propTypes = {
    currentPath: PropTypes.string.isRequired,
    basePath: PropTypes.string.isRequired,
    setCurrentPath: PropTypes.func.isRequired,
    rmSelected: PropTypes.func.isRequired,
    modalOpen: PropTypes.bool.isRequired,
    openModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    onNewSnippet: PropTypes.func.isRequired,
    onNewNotebook: PropTypes.func.isRequired,
    onMultipleMetadata: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = { toggleDeleteModal: false }
  }

  render() {
    const {
      currentPath,
      basePath,
      setCurrentPath,
      rmSelected,
      modalOpen,
      openModal,
      closeModal,
      onNewSnippet,
      onMultipleMetadata,
      // onNewNotebook,
    } = this.props

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
          <i className="fa fa-arrow-left" />
        </Button>

        <Button
          extraClassNames="m-l-sm"
          onClick={() => {
            this.setState({ toggleDeleteModal: !this.state.toggleDeleteModal })
          }}
        >
          <i className="fa fa-trash" />
        </Button>

        <Popover
          text={'Edit the metadata of multiple files at once.'}
        >
          <Button
            extraClassNames="m-l-sm"
            onClick={onMultipleMetadata}
          >
            <i className="fa fa-tags" />
          </Button>
        </Popover>

        <Prompt
          onSubmit={onNewSnippet}
          extraClassNames="m-l-sm"
          placeholder="Snippet name..."
        >
          Python snippet
          <Popover
            text={`Open a new python file in the current
                   folder where you can quickly build some code to process files.`}
          />
        </Prompt>

        {/*
        <Prompt
          onSubmit={onNewNotebook}
          extraClassNames="m-l-sm"
          placeholder="Notebook name..."
        >
          New notebook
        </Prompt>
        */}

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

        <DeleteModal
          show={this.state.toggleDeleteModal}
          onHide={() => {
            this.setState({ toggleDeleteModal: !this.state.toggleDeleteModal })
          }}
          onConfirmDelete={() => {
            this.setState({ toggleDeleteModal: !this.state.toggleDeleteModal })
            rmSelected()
          }}
        />

      </div>
    )
  }
}

export default { FileSystemActionBar }
