import React, { PropTypes } from 'react'
import _ from 'lodash'
import moment from 'moment'

class LogScroll extends React.Component {
  static propTypes = {
    logs: PropTypes.object.isRequired,
  }

  render() {
    const logs = _.map(this.props.logs, l => l)

    logs.sort((a, b) => {
      a = new Date(a.datetime) // eslint-disable-line
      b = new Date(b.datetime) // eslint-disable-line
      return a > b ? -1 : a < b ? 1 : 0 // eslint-disable-line
    })

    return (
      <div
        ref={(c) => { this._element = c }}
        className="m-t m-b"
        style={{
          backgroundColor: 'white',
          overflowY: 'scroll'
        }}
      >
        {_.map(logs, l => {
          let iClass = 'fa-file-text-o'

          if (l.filepath.indexOf('/') > -1) {
            iClass = 'fa-folder-o'
          }

          if (l.status === 'complete') {
            iClass = 'fa-check'
          }

          if (l.status === 'ignored') {
            iClass = 'fa-check text-muted'
          }

          if (l.status === 'started') {
            iClass = 'fa-spinner fa-spin'
          }

          if (l.status === 'error') {
            iClass = 'fa-cross'
          }

          return (
            <div
              className="p-l"
              style={{
                marginTop: '10px'
              }}
              key={`log-${l.filepath}${l.datetime}${l.status}`}
            >
              <div className="row">
                <div className="col-sm-11">
                  <i className={`fa ${iClass}`}></i>{'  '}
                  {l.filepath}
                  <small className="text-muted m-l-sm">
                    {moment(l.datetime).fromNow()}
                  </small>
                </div>
              </div>

              {true &&
                _.map(l.messages, m =>
                  <div
                    className="row"
                    style={{
                      fontSize: '0.9em'
                    }}
                  >
                    <div className="col-sm-11 col-sm-offset-1 text-muted">
                      {`>>> ${m}`}
                    </div>
                  </div>
                )
              }
            </div>
          )
        })}
      </div>
    )
  }
}

export { LogScroll }
