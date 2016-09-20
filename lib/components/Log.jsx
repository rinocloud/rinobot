import React, { PropTypes } from 'react'
import pt from 'path'
import moment from 'moment.twitter'
import { shell } from 'electron'
import _ from 'lodash'

class Log extends React.Component {

  static propTypes = {
    lastRun: PropTypes.string,
    etag: PropTypes.string,
    completed: PropTypes.array,
    id: PropTypes.number,
    current: PropTypes.string,
    error: PropTypes.object,
    stdout: PropTypes.array,
    filepath: PropTypes.string
  }


  constructor(props) {
    super(props)

    this.toggleExtra = this.toggleExtra.bind(this)

    this.state = {
      extraOpen: false
    }
  }

  toggleExtra(e) {
    e.preventDefault()
    this.setState({ extraOpen: !this.state.extraOpen })
  }

  render() {
    const {
      filepath,
      lastRun,
      completed,
      current,
      error,
      stdout
    } = this.props

    const { extraOpen } = this.state
    const hasStdout = stdout.length > 0

    if (pt.basename(filepath).startsWith('.')) return null

    return (
      <div className="row log">
        <div className="col-sm-12">
          <div className="row">

            <div className="col-sm-8">

              <a href="#" onClick={this.toggleExtra}>
                {error &&
                  <i
                    style={{ marginRight: '-2px' }}
                    className="fa fa-exclamation-triangle text-danger"
                  />}
              </a>

              {(completed.length > 0 && !error) &&
                <i className="fa fa-check-circle text-success"></i>
              }
              {(completed.length === 0 && !error && !hasStdout) &&
                <i className="fa fa-2 fa-file-text-o text-muted"></i>
              }

              <a
                href="#"
                className="m-l m-r"
                onClick={(e) => {
                  e.preventDefault()
                  shell.openItem(filepath)
                }}
              >
                {pt.basename(filepath)}
                {!error && hasStdout &&
                  <i className="fa fa-notificatio fa-exclamatio-circle text-danger" />}
              </a>
              <a href="#" onClick={this.toggleExtra}>
                {error && !extraOpen &&
                  <i className="fa fa-toggle-right text-danger" />}
                {error && extraOpen &&
                  <i className="fa fa-toggle-down text-danger" />}
                {!error && hasStdout && !extraOpen &&
                  <i className="fa fa-toggle-right text-success" />}
                {!error && hasStdout && extraOpen &&
                  <i className="fa fa-toggle-down text-success" />}
              </a>

            </div>

            <div className="col-sm-1">
              <small className="text-muted">
                {`${moment(lastRun).twitter()} ago`}
              </small>
            </div>

            <div className="col-sm-3">
              {current && <small
                style={{ maxHeight: '30px', overflowX: 'scroll' }}
              >
                <i
                  className="fa fa-cog fa-spin"
                  style={{ marginRight: '6px' }}
                ></i>
                {current}
                <br />
              </small>
            }

              {_.map(completed, (m, i) =>
                <small
                  key={`msg${i}${lastRun}`}
                  style={{ maxHeight: '30px', overflowX: 'scroll' }}
                >
                  <i
                    className="fa fa-level-up fa-rotate-90"
                    style={{ marginRight: '6px' }}
                  ></i>
                  {m.split(',')[0].replace('rinobot-plugin-', '')}<br />
                </small>
              )}
            </div>

          </div>

          <div className="row">
            <div className="col-sm-12">
              {error && extraOpen &&
                <pre
                  className="text-danger"
                  style={{
                    border: 'none',
                    backgroundColor: 'white',
                    fontFamily: 'monospace',
                  }}
                >
                  {error.message}
                </pre>
              }
              {!error && extraOpen &&
                <pre
                  style={{
                    border: 'none',
                    backgroundColor: 'white',
                    fontFamily: 'monospace',
                  }}
                >
                  {stdout.join('\n')}
                </pre>
              }

            </div>
          </div>
        </div>

      </div>
    )
  }
}

export { Log }
