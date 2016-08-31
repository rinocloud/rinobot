import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'
import moment from 'moment'

class LogScroll extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  render() {
    let logs = _.map(this.props.history, (val, key) => ({
      ...val,
      filepath: key
    }))

    logs.sort((a, b) => {
      a = new Date(a.lastRun) // eslint-disable-line
      b = new Date(b.lastRun) // eslint-disable-line
      return a > b ? -1 : a < b ? 1 : 0 // eslint-disable-line
    })

    logs = logs.slice(0, 5)

    console.log(logs)

    return (
      <div
        className="m-t m-b"
        style={{
          backgroundColor: 'white',
          overflowY: 'scroll'
        }}
      >
        {_.map(logs, (l, i) => {
          return (
            <div
              className="p-l"
              style={{
                marginTop: '10px'
              }}
              key={`log-${i}`}
            >
              <div className="row">
                <div className="col-sm-11">
                  {pt.basename(l.filepath)}
                  <small className="text-muted m-l-sm">
                    {moment(l.lastRun).fromNow()}
                  </small>
                </div>
              </div>

              {_.map(l.completed, (m, i) =>
                <div
                  key={`logmsg${i}`}
                  className="row"
                  style={{
                    fontSize: '0.9em'
                  }}
                >
                  <div className="col-sm-11 col-sm-offset-1 text-muted">
                    {`>>> ${m}`}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
}

export { LogScroll }
