import React, { PropTypes } from 'react'


class LogScroll extends React.Component {
  static propTypes = {
    logs: PropTypes.array.isRequired,
  }

  componentDidMount() {
    this.scroll()
  }

  componentDidUpdate() {
    this.scroll()
  }

  scroll() {
    this._element.scrollTop = this._element.scrollHeight
  }

  render() {
    return (
      <pre
        ref={(c) => { this._element = c }}
        className="bordered m-t"
        style={{
          backgroundColor: 'white',
          fontSize: '12px',
          maxHeight: '200px',
          overflowY: 'scroll'
        }}
      >
        {this.props.logs.map(l => `${l}\n`)}
      </pre>
    )
  }
}

export { LogScroll }
