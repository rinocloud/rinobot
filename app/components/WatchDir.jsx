import React, { PropTypes } from 'react'
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
    installedPackages: PropTypes.array.isRequired
  }


  render() {
    const { dir, installedPackages } = this.props

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
      this.props.removeDotRino()
    }

    const firstTime = dir.config === null;

    return (
      <div className="p-a bordered m-t">
        <div className="row">
          <div className="col-sm-12 lead">
            <a href="#" onClick={openPluginHomepage}>{dir.path}</a>
            <a
              href="#"
              className="m-l-sm btn btn-sm btn-danger pull-right"
              onClick={onRemoveDirClick}
            >
              <span><i className="fa fa-trash"></i> Remove</span>
            </a>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
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
            {/* {process.env.NODE_ENV === 'development' ?
              <a
                href="#"
                className="m-l-sm btn btn-sm btn-danger pull-right"
                onClick={removeDotRino}
              >
                x
              </a>
            : null}*/}
            {/* <a
              href="#"
              className="m-l-sm btn btn-sm btn-danger pull-right"
              onClick={onRemoveDirClick}
            >
              <span><i className="fa fa-remove"></i> remove</span>
            </a>*/}
          </div>
        </div>
      {firstTime && !dir.configOpen ?
        <div
          className="alert alert-warning alert-dismissible fade in m-t"
          role="alert"
        >
          Please, select the folder's <strong>'settings'</strong> before your start.
        </div>
        : null}

        {dir.configOpen ?
          <ConfigurePipeline
            dir={dir}
            onSetConfig={this.props.onSetConfig}
            installedPackages={installedPackages}
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
