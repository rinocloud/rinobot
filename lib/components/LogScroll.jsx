import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'
import moment from 'moment'

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
      <div className="row">
        <div className="col-sm-8">
          <table
            className="table m-t p-l"
          >
            <tbody>
            {_.map(logs, (l, i) => {
              return (
                <tr key={`hist-${i}`}>
                  <td>
                    {l.completed.length ?
                      <i className="fa fa-2 fa-file-text-o"></i>
                      :
                      <i className="fa fa-2 fa-file-text-o text-muted"></i>
                    }
                  </td>
                  <td>
                    <small>{pt.basename(l.filepath)}</small>
                  </td>
                  <td>
                    <small className="text-muted">{moment(l.lastRun).fromNow()}</small>
                  </td>
                  <td style={{ minWidth: '250px' }}>
                    {_.map(l.completed, (m, i) =>
                      <small
                        key={`msg${i}${l.lastRun}`}
                        style={{ maxHeight: '30px', overflowX: 'scroll' }}
                      >
                        <i
                          className="fa fa-level-up fa-rotate-90"
                          style={{ marginRight: '6px' }}
                        ></i>
                        {m.split(',')[0]}<br />
                      </small>
                    )}
                  </td>
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export { LogScroll }
