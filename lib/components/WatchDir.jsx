import React, { PropTypes } from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { ConfigurePipeline } from './ConfigurePipeline'
import { LogScroll } from './LogScroll'
import { Tree } from './Tree'
const { shell } = require('electron')


class WatchDir extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onStopClick: PropTypes.func.isRequired,
    onRemoveDirClick: PropTypes.func.isRequired,
    onToggleConfigClick: PropTypes.func.isRequired,
    onToggleLogsClick: PropTypes.func.isRequired,
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

    const onToggleLogsClick = (e) => {
      e.preventDefault()
      this.props.onToggleLogsClick()
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
      <div className="p-a bordered m-t">
        <div className="row">
          <div className="col-sm-12 lead">
            <a href="#" onClick={openPluginHomepage}>{dir.path}</a>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={ClearRecord}
            >
              <a
                className="fa fa-info-circle pull-right m-t-sm fa-lg text-muted"
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

            {!dir.configOpen ? // eslint-disable-line
              dir.isStarted ?
                <a
                  href="#"
                  className="btn btn-sm btn-danger"
                  onClick={onStopClick}
                >
                  Stop
                </a>
                 :

                <a
                  href="#"
                  className="btn btn-sm btn-success"
                  onClick={onStartClick}
                  data-dismiss="alert"
                >
                  Start
                </a>
              : null
            }

            {!dir.isStarted ?
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
                onClick={onToggleConfigClick}
              >
                {dir.configOpen ?
                  <span><i className="fa fa-save"></i> Save</span>
                  :
                  <span><i className="fa fa-cogs"></i> Settings</span>
                }
              </a>
              : null
            }
          </div>
        </div>
      {firstTime && !dir.configOpen ?
        <div
          className="m-t-sm"
          role="alert"
        >
          Select the folder's <strong>'settings'</strong> before you start to set up some tasks.
          <br />
          <a
            href="http://docs.rinocloud.com/rinobot/tasks/getting_started.html"
            onClick={openExternal}
          >
          Tasks Getting Started guide
          </a>
        </div>
        : null}

        {dir.configOpen ?
          <ConfigurePipeline
            dir={dir}
            onSetConfig={this.props.onSetConfig}
            packagesConfig={packagesConfig}
          />
        :
        ''}

        {dir.isStarted ?
          <div className="m-t configForm">
            <div className="row">
              <div className="col-sm-12">
                {dir.isBusy ?
                  <i className="fa fa-spinner fa-spin"></i>
                :
                  <i className="fa fa-check"></i>
                }
                {'  '}
                {dir.processedFiles}/{dir.totalFiles} files processed
              </div>
              <div className="col-sm-12">
                <span
                  style={{ minHeight: '20px' }}
                  dangerouslySetInnerHTML={{ __html: dir.lastLog }}
                />
                <div>
                {dir.isStarted ?
                  <a
                    href="#"
                    className="text-muted m-l-sm"
                    onClick={onToggleLogsClick}
                  >
                    <p>
                  {dir.logsOpen ?
                    <span className="text-muted">
                      <a className="btn btn-default btn-sm fa fa-align-justify"> More</a> {'  '}
                      <i className="btn btn-default btn-sm fa fa-times"> Close</i>
                    </span> // eslint-disable-line
                    :
                    <span className="text-muted">
                      <a className="btn btn-default btn-sm fa fa-align-justify"> More</a>
                    </span>
                    }
                    </p>
                  </a>
                : null}

                {/*
                {dir.isStarted ?
                  <a
                    href="#"
                    className="text-muted m-l-sm pull-right"
                    onClick={onToggleLogsClick}
                  >
                  {dir.logsOpen ?
                    <span className="text-muted"><i className="fa fa-compress"></i> close logs</span> // eslint-disable-line
                    :
                    <span className="text-muted"><i className="fa fa-expand"></i> open logs</span>
                    }
                  </a>
                : null}*/}
                </div>
                {dir.logsOpen ?
                  <div>
                    {/*<LogScroll logs={dir.logs} />*/}
                    <div className="p-a bordered m-t bg-muted">
                      <div className="row">
                        <pre className="pull-left  col-sm-12"> File/Folder Status</pre>
                        <Tree />
                      </div>
                    </div>
                  </div>
                : null
                }
              </div>
            </div>
          </div>
        : ''}
      </div>

    )
  }
}

export { WatchDir }
