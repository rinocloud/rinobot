import React, { PropTypes } from 'react'
import { Modal, Button } from 'react-bootstrap'

export class DeleteModal extends React.Component {
  static propTypes = {
    onHide: PropTypes.func.isRequired,
    onConfirmDelete: PropTypes.func.isRequired,
    show: PropTypes.bool,
  }

  render() {
    const { show = false, onHide, onConfirmDelete } = this.props

    return (
      <div>
        <Modal
          bsSize="small"
          show={show}
          onHide={onHide}
          className="text-center"
        >
          <Modal.Header closeButton>
            <img
              alt="Nice robot for deletion"
              src="../delete.jpg"
              style={{ width: '60%' }}
            />
          </Modal.Header>
          <Button
            className="btn-default m-t m-b m-r"
            onClick={(e) => {
              e.preventDefault()
              onHide()
            }}
          >
            Back
          </Button>
          <Button
            className="btn-danger m-t m-b ignore-react-onclickoutside"
            onClick={(e) => {
              e.preventDefault()
              onConfirmDelete()
            }}
          >
            Confirm Deletion
          </Button>
        </Modal>
      </div>
    )
  }
}

export default { DeleteModal }
