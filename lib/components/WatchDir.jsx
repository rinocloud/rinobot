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
      <div className="p-a m-t m-l">
        <div className="row">
          <div className="col-sm-12 lead m-t m-l">
            <a href="#" onClick={openPluginHomepage}>{dir.path}</a>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 m-l">
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

            {!dir.configOpen && dir.isStarted &&
              <a
                href="#"
                className="btn btn-sm btn-danger"
                onClick={onStopClick}
              >
                Stop
              </a>
            }

            {(!dir.configOpen && !dir.isStarted) &&
              <a
                href="#"
                className="btn btn-sm btn-success"
                onClick={onStartClick}
                data-dismiss="alert"
              >
                Start
              </a>
            }

            {dir.configOpen &&
              <a
                href="#"
                className="btn btn-sm btn-success disabled"
                data-dismiss="alert"
                disabled
              >
                Start
              </a>
            }


            {!dir.isStarted && dir.configOpen &&
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
                onClick={onToggleConfigClick}
              >
                <span><i className="fa fa-save"></i> Save</span>
              </a>
            }

            {!dir.isStarted && !dir.configOpen &&
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-default"
                onClick={onToggleConfigClick}
              >
                <span><i className="fa fa-cogs"></i> Setup</span>
              </a>
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
              <div className="col-sm-12 m-l">
                {dir.isBusy ?
                  <i className="fa fa-spinner fa-spin"></i>
                :
                  <i className="fa fa-check"></i>
                }
                {'  '}
                {dir.processedFiles}/{dir.totalFiles} files processed
              </div>
              <div className="col-sm-12 m-l">
                <span
                  style={{ minHeight: '20px' }}
                  dangerouslySetInnerHTML={{ __html: dir.lastLog }}
                />
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
                : null}
                {dir.logsOpen ?
                  <LogScroll logs={dir.logs} />
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
