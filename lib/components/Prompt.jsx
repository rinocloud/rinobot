import React, { PropTypes } from 'react'
import Modal, { Body, Footer } from 'react-bootstrap/lib/Modal'
import { Button } from './Button'

class Prompt extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    extraClassNames: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
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
    const {
      onSubmit,
      children,
      extraClassNames = '',
      placeholder = ''
    } = this.props

    return (
      <span>
        <Modal bsSize="small" show={show} onHide={this.onHide} className="text-center">
          <Body>
            <form onSubmit={this.onSubmitForm}>
              <input
                ref={input => input && input.focus()}
                name="name"
                onChange={this.onChangeInput}
                placeholder={placeholder}
                className="form-control"
              />
            </form>

          </Body>
          <Footer>
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
              Submit
            </Button>
          </Footer>
        </Modal>

        <Button onClick={this.onShow} extraClassNames={extraClassNames}>
          {children}
        </Button>
      </span>
    )
  }
}


export default { Prompt }
