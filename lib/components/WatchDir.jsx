import React, { PropTypes } from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { ConfigurePipeline } from './ConfigurePipeline'
import { LogScroll } from './LogScroll'
const { shell } = require('electron')


class WatchDir extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onStopClick: PropTypes.func.isRequired,
    onRemoveDirClick: PropTypes.func.isRequired,
    onToggleConfigClick: PropTypes.func.isRequired,
    removeDotRino: PropTypes.func.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    packagesConfig: PropTypes.object
  }

  render() {
    const { dir, packagesConfig } = this.props

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const onStartClick = (e) => {
      e.preventDefault()
      this.props.onStartClick()
    }

    const onStopClick = (e) => {
      e.preventDefault()
      this.props.onStopClick()
    }

    const onRemoveDirClick = (e) => {
      e.preventDefault()
      this.props.onRemoveDirClick()
    }

    const onToggleConfigClick = (e) => {
      e.preventDefault()
      this.props.onToggleConfigClick()
    }

    const openPluginHomepage = (e) => {
      e.preventDefault()
      shell.showItemInFolder(dir.path)
    }

    const removeDotRino = (e) => {
      e.preventDefault()
      if (confirm("All data will be re-processed next time. Are you sure you want to do this?")) { // eslint-disable-line
        this.props.removeDotRino()
      }
    }

    const firstTime = dir.config === null;

    const ClearRecord = (
      <Popover
        id="popover-trigger-hover-focus"
      >
        <small>
          This will clear Rinobots logs for this folder, so you can re-run all tasks.
          Click to learn more.
        </small>
      </Popover>
    )

    return (
      <div>
        <div className="panel panel-default m-t">
          <div className="panel-heading">
            {dir.path}
            <a
              href="#"
              onClick={openPluginHomepage}
              className="pull-right"
            >
              Open <i className="fa fa-external-link"></i>
            </a>
          </div>
          <div className="panel-body">
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={ClearRecord}
            >
              <a
                className="fa fa-question-circle-o pull-right m-t-sm fa-lg text-muted"
                href="http://docs.rinocloud.com/rinobot/introduction/clearing_rinobot_records.html"
                onClick={openExternal}
              >
              </a>
            </OverlayTrigger>
            <a
              href="#"
              className="m-l-sm btn btn-xs btn-danger pull-right"
              onClick={removeDotRino}
            >
              Clear record
            </a>
            <a
              href="#"
              className="m-l-sm btn btn-xs btn-danger pull-right"
              onClick={onRemoveDirClick}
            >
              <span><i className="fa fa-trash"></i> Remove</span>
            </a>

            {dir.isStarted &&
              <a
                href="#"
                className="btn btn-sm btn-danger"
                onClick={onStopClick}
              >
                Stop
              </a>
            }

            {!dir.isStarted &&
              <a
                href="#"
                className="btn btn-sm btn-success"
                onClick={onStartClick}
                data-dismiss="alert"
              >
                Start
              </a>
            }

            {/*{dir.isConfigOpen &&
              <a
                href="#"
                className="btn btn-sm btn-success disabled"
                data-dismiss="alert"
                disabled
              >
                Start
              </a>
            }*/}

            {!dir.isStarted &&
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
                onClick={onToggleConfigClick}
              >
                <span><i className="fa fa-save"></i> Save</span>
              </a>
            }

            {/* {!dir.isStarted && !dir.isConfigOpen &&
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
                onClick={onToggleConfigClick}
              >
                <span><i className="fa fa-cogs"></i> Setup</span>
              </a>
            } */}

            {firstTime && !dir.isConfigOpen ?
              <div
                className="m-t-sm"
                role="alert"
              >
                Select the folder's
                <strong>'settings'</strong>
                before you start to set up some tasks.
                <br />
                <a
                  href="http://docs.rinocloud.com/rinobot/tasks/getting_started.html"
                  onClick={openExternal}
                >
                Tasks Getting Started guide
                </a>
              </div>
            : null}

            <ConfigurePipeline
              // it has state - so give it some novel key
              key={`configpipe-${dir.config.tasks[0].command}`}
              dir={dir}
              onSetConfig={this.props.onSetConfig}
              packagesConfig={packagesConfig}
            />
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
            Activity log
          </div>
          <div className="panel-body">
            {dir.isStarted ?
              <div className="m-t configForm">
                <div className="row">
                  <div className="col-sm-12">
                    {dir.processedFiles}/{dir.totalFiles} files processed
                    {/* {dir.isStarted ?
                      <a
                        href="#"
                        className="text-muted m-l-sm pull-right"
                        onClick={onToggleLogsClick}
                      >
                      {dir.isLogsOpen ?
                        <span className="text-muted"><i className="fa fa-compress"></i> close logs</span>
                        :
                        <span className="text-muted"><i className="fa fa-expand"></i> open logs</span>
                        }
                      </a>
                    : null} */}

                  </div>
                  <div className="col-sm-12">
                     {dir.isLogsOpen && <LogScroll history={dir.history} />}
                  </div>
                </div>
              </div>
            : ''}

          </div>
        </div>
      </div>

    )
  }
}

export { WatchDir }
