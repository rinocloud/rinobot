import React, { PropTypes } from 'react'
import { Modal } from 'react-bootstrap'
import { Button } from './Button'

export class PipelineSaveButton extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = { show: false, name: null }

    this.onShow = this.onShow.bind(this)
    this.onHide = this.onHide.bind(this)
    this.onChangeInput = this.onChangeInput.bind(this)
    this.onSubmitForm = this.onSubmitForm.bind(this)
  }

  onChangeInput(e) {
    e.preventDefault()
    this.setState({ name: e.target.value })
  }

  onSubmitForm(e) {
    e.preventDefault()

    const { onSubmit } = this.props
    const name = e.target.name.value
    this.setState({ name, show: false })
    if (name) onSubmit(name)
  }

  onShow() {
    this.setState({ show: true })
  }

  onHide() {
    this.setState({ show: false })
  }

  render() {
    const { show, name } = this.state
    const { onSubmit } = this.props

    return (
      <div>
        <Modal bsSize="small" show={show} onHide={this.onHide} className="text-center">
          <Modal.Body>
            <form onSubmit={this.onSubmitForm}>
              <input
                name="name"
                onChange={this.onChangeInput}
                placeholder="Name for task process"
                className="form-control"
              />
            </form>

          </Modal.Body>
          <Modal.Footer>
            <Button
              extraClassNames="btn-default btn-xs pull-left"
              onClick={() => {
                this.onHide()
              }}
            >
              Cancel
            </Button>
            <Button
              extraClassNames="btn-danger btn-xs pull-right ignore-react-onclickoutside"
              onClick={() => {
                this.onHide()
                if (name) onSubmit(name)
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        <Button onClick={this.onShow} extraClassNames="pull-right m-r-sm">
          Save
        </Button>
      </div>
    )
  }
}


export default { PipelineSaveButton }
