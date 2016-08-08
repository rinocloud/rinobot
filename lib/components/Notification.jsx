import React, { PropTypes } from 'react'

export class Notification extends React.Component {

  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    dismissAfter: PropTypes.number,
    children: PropTypes.array.isRequired,
    text: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    userDismissable: PropTypes.bool.isRequired
  }


  constructor() {
    super()
    this.state = {
      dismissing: false
    }
    this.dismiss = this.dismiss.bind(this)
    this.onElement = this.onElement.bind(this)
  }

  componentDidMount() {
    if (this.props.dismissAfter) {
      this.setDismissTimer()
    }
  }

  componentWillReceiveProps(next) {
    // if we have a timer going and the notification text
    // changed we reset the timer
    if (next.text !== this.props.text) {
      if (this.props.dismissAfter) {
        this.resetDismissTimer()
      }
      if (this.state.dismissing) {
        this.setState({ dismissing: false })
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.dismissTimer)
  }

  onElement(el) {
    if (el) {
      el.addEventListener('webkitTransitionEnd', () => {
        if (this.state.dismissing) {
          this.props.onDismiss()
        }
      })
      const { backgroundColor } = this.props
      if (backgroundColor) {
        el.style.setProperty(
          'background-color',
          backgroundColor,
          'important'
        )
      }
    }
  }

  setDismissTimer() {
    this.dismissTimer = setTimeout(() => {
      this.dismiss()
    }, this.props.dismissAfter)
  }

  dismiss() {
    this.setState({ dismissing: true })
  }

  resetDismissTimer() {
    clearTimeout(this.dismissTimer)
    this.setDismissTimer()
  }

  render() {
    const { backgroundColor } = this.props
    const opacity = this.state.dismissing ? 0 : 1
    return (
      <div
        className="notification"
        style={{ opacity, backgroundColor }}
        ref={this.onElement}
      >
      {this.props.children || this.props.text}
      {
        this.props.userDismissable
        ? <a onClick={this.dismiss} > [x] </a> : null
      }
      </div>
    )
  }
}
