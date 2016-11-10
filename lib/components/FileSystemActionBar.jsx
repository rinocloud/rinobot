import React, { PropTypes } from 'react'
import pt from 'path'
import { Button } from '../components/Button'
import { Prompt } from '../components/Prompt'
import { DeleteModal } from '../components/DeleteModal'


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
      onNewSnippet
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
          <i className="fa fa-arrow-left" />{' '}
          Back
        </Button>

        <Button
          extraClassNames="m-l-sm"
          onClick={() => {
            this.setState({ toggleDeleteModal: !this.state.toggleDeleteModal })
          }}
        >
          <i className="fa fa-times m-r-sm" />
          Delete
        </Button>

        <Prompt
          onSubmit={onNewSnippet}
          extraClassNames="m-l-sm"
          placeholder="Snippet name..."
        >
          New python snippet
        </Prompt>

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
