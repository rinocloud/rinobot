import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'
import moment from 'moment.twitter'

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
        <div className="col-sm-12">
          <table
            className="table m-t p-l"
          >
            <thead>
              <tr>
                <th>Filename</th>
                <th>Processed</th>
                <th>Tasks run</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
            {_.map(logs, (l, i) => {
              return (
                <tr key={`hist-${i}`}>
                  <td className="col-sm-4">
                    {l.completed.length ?
                      <i className="fa fa-2 fa-file-text-o"></i>
                      :
                      <i className="fa fa-2 fa-file-text-o text-muted"></i>
                    }{'  '}
                    <small>{pt.basename(l.filepath)}</small>
                  </td>

                  <td className="col-sm-1">
                    <small className="text-muted">
                      {`${moment(l.lastRun).twitter()} ago`}
                    </small>
                  </td>

                  <td className="col-sm-3">
                    {l.current && <small
                      style={{ maxHeight: '30px', overflowX: 'scroll' }}
                    >
                      <i
                        className="fa fa-cog fa-spin"
                        style={{ marginRight: '6px' }}
                      ></i>
                      {l.current}<br />
                    </small>}
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

                  {l.error &&
                    <td className="col-sm-4">
                      <small
                        className="text-danger"
                        style={{
                          border: 'none',
                          backgroundColor: 'white',
                          fontFamily: 'monospace',
                          fontSize: '0.7em',
                          padding: 0,
                        }}
                      >
                        {l.error.message}
                      </small>
                    </td>
                  }

                  <td className="col-sm-4">
                  {!l.error && _.map(l.stdout, (m, i) =>
                    <pre
                      key={`e${i}`}
                      style={{
                        border: 'none',
                        backgroundColor: 'white',
                        fontFamily: 'monospace',
                        fontSize: '0.7em',
                        padding: 0,
                      }}
                    >
                      {m}
                    </pre>
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
