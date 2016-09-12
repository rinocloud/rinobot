import React, { PropTypes } from 'react'
import _ from 'lodash'
import { Log } from './Log'

class LogScroll extends React.Component {
  static propTypes = {
    history: PropTypes.object
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

    logs = logs.slice(0, 50)
    return (
      <div>

        {logs.length === 0 && _.map(_.range(4), (l, i) => {
          return (
            <div className="log row m-b-sm" key={`pseudo-hist-${i}`}>
              <div className="col-sm-8">
                <i className="pseudo-fa fa fa-2 fa-file-text-o text-muted"></i>
                {'  '}
                <span className="pseudo"></span>
              </div>

              <div className="col-sm-1">
                <span className="pseudo"></span>
              </div>

              <div className="col-sm-3">
                <span className="pseudo"></span>
              </div>
            </div>
          )
        })}

        {_.map(logs, (l, i) =>
          <Log
            key={`hist-${i}`}
            {...l}
          />
        )}
      </div>
    )
  }
}

export { LogScroll }
