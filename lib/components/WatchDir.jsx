import React, { PropTypes } from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import { ConfigurePipeline } from './ConfigurePipeline'
import { LogScroll } from './LogScroll'
import { shell } from 'electron'


class WatchDir extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onStartClick: PropTypes.func.isRequired,
    isStarting: PropTypes.bool.isRequired,
    onStopClick: PropTypes.func.isRequired,
    onRemoveDirClick: PropTypes.func.isRequired,
    onToggleConfigClick: PropTypes.func.isRequired,
    removeDotRino: PropTypes.func.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    registry: PropTypes.array.isRequired,
    packagesConfig: PropTypes.object.isRequired
  }

  render() {
    const { dir, registry, packagesConfig, isStarting } = this.props

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
        <div className="panel panel-default">
          <div className="panel-heading">
            {dir.path}
            <a
              href="#"
              onClick={openPluginHomepage}
              className="pull-right"
            >
              Open <i className="fa fa-external-link"></i>
            </a>

            <a
              href="#"
              className="pull-right m-r"
              onClick={removeDotRino}
            >
              Clear record
            </a>
            <a
              href="#"
              className="m-r pull-right"
              onClick={onRemoveDirClick}
            >
              <span><i className="fa fa-trash"></i> Remove</span>
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
              className="m-l-sm btn btn-sm btn-default"
              onClick={onToggleConfigClick}
              disabled={dir.isStarted}
            >
              <span><i className="fa fa-save"></i> Save</span>
            </a>


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
              key={`configpipe-${dir.config.tasks.length}`}
              dir={dir}
              onSetConfig={this.props.onSetConfig}
              packagesConfig={packagesConfig}
              registry={registry}
            />
          </div>
        </div>

        <div className="m-b text-center">
          {dir.isStarted && !isStarting &&
            <a
              href="#"
              className="btn btn-danger"
              onClick={onStopClick}
            >
              Stop
            </a>
          }

          {dir.isStarted && isStarting &&
            <a
              href="#"
              className="btn btn-default"
              onClick={onStopClick}
              disabled
            >
              Starting <i className="fa fa-spinner fa-spin"></i>
            </a>
          }

          {!dir.isStarted &&
            <a
              href="#"
              className="btn btn-success"
              onClick={onStartClick}
              data-dismiss="alert"
            >
              Start
            </a>
          }

        </div>

        <div className="panel panel-default">
          <div className="panel-heading">
            Activity log
            <div className="pull-right">{dir.processedFiles}/{dir.totalFiles} files processed</div>
          </div>
          <div className="panel-body">
            <div className="configForm">
              <div className="row">
                <div className="col-sm-12">
                  <LogScroll history={dir.history} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export { WatchDir }
