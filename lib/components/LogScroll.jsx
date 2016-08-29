import React, { PropTypes } from 'react'
import _ from 'lodash'

class LogScroll extends React.Component {
  static propTypes = {
    logs: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this.scroll()
  }

  componentDidUpdate() {
    this.scroll()
  }

  scroll() {
    // this._element.scrollTop = this._element.scrollHeight
  }

  render() {
    const logs = _.map(this.props.logs, l => l)

    logs.sort((a, b) => {
      a = new Date(a.datetime)
      b = new Date(b.datetime)
      return a > b ? -1 : a < b ? 1 : 0
    })

    return (
      <div
        ref={(c) => { this._element = c }}
        className="bordered m-t"
        style={{
          backgroundColor: 'white',
          maxHeight: '200px',
          overflowY: 'scroll'
        }}
      >
        {_.map(logs, l => {
          let iClass = 'fa-file-text-o'
          if (l.status.indexOf('complete') > -1) {
            iClass = 'fa-check'
          }

          return (
            <div
              className="p-l m-b m-t"
              key={`log-${l.filepath}${l.datetime}${l.status}`}
            >
              <div className="row">
                <div
                  className="col-sm-1"
                  style={{
                    marginTop: '4px',
                    width: '40px'
                  }}
                >
                  <i
                    className={`fa fa-2x ${iClass}`}
                  ></i>
                </div>
                <div className="col-sm-11">
                  {l.filepath} - {l.status}
                  <br />
                  <small className="text-muted">{l.datetime}</small>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    )
  }
}

export { LogScroll }
