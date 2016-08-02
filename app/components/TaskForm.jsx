import React from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
const { dialog } = require('electron').remote;

class TaskForm extends React.Component {

  constructor(props) {
    super(props)
    this.handleChangeMatch = this.handleChangeMatch.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)

    this.state = {
      extraArgs: true
    }
  }

  handleChangeMatch(field) {
    const { task, onChange } = this.props //eslint-disable-line
    return function (e) {
      e.preventDefault()
      const state = {
        ...task,
        [field]: e.target.value
      }
      onChange(state)
    }
  }

  handleRemoveClick(e) {
    const { onRemove } = this.props //eslint-disable-line
    e.preventDefault()
    onRemove()
  }

  render() {
    const { task, pop, installedPackages } = this.props //eslint-disable-line
    const myPopover = (
      <Popover
        id="popover-trigger-hover-focus"
        title="what Select command means for you?"
      >
        A lot - Click here for more info
      </Popover>
    )
    const Match = (
      <Popover
        id="popover-trigger-hover-focus"
        title="what file macth is?"
      >
        A lot - Rinobot book
      </Popover>
    )
    const Upload = (
      <Popover
        id="popover-trigger-hover-focus"
        title="Upload"
      >
        A lot - Rinobot book
      </Popover>
    )
    const Copy = (
      <Popover
        id="popover-trigger-hover-focus"
        title="Copy"
      >
        A lot - Rinobot book
      </Popover>
    )
    const Select = (
      <Popover
        id="popover-trigger-hover-focus"
        title="Copy"
      >
        A lot - Rinobot book
      </Popover>
    )
    const CommandRun = (
      <Popover
        id="popover-trigger-hover-focus"
        title="Copy"
      >
        A lot - Rinobot book
      </Popover>
    )
    const Argument = (
      <Popover
        id="popover-trigger-hover-focus"
        title="get command argument"
      >
        A lot - Rinobot book
      </Popover>
    )
    return (
      <div className="form-group">
        <div className="col-xs-4">
          <small> Select command to run</small>
        {pop ?
          <OverlayTrigger
            trigger={['hover']}
            placement="bottom"
            overlay={myPopover}
          >
            <i className="fa fa-question-circle-o m-l-sm"></i>
          </OverlayTrigger>
          : null}
          <select
            type="text"
            value={task.command || ''}
            className="form-control"
            onChange={this.handleChangeMatch('command')}
          >
            <option value="upload">Rinocloud-upload</option>
            <option value="copy" >Copy</option>
            <option value="matlab">MATLAB</option>
            <option value="python">Python</option>
            <option value="Rscript">Rscript</option>
            <option value="custom">Custom</option>
            {installedPackages.map((packageName) =>
              <option key={packageName} value={packageName}>
                {packageName}
              </option>
            )}
          </select>

        </div>

        <div className="col-xs-3">
          <small> Add file to match </small>
    {pop ?
      <OverlayTrigger
        trigger={['hover']}
        placement="bottom"
        overlay={Match}
      >
        <i className="fa fa-question-circle-o m-l-sm"></i>
      </OverlayTrigger>
      : null}
          <input
            key={'myMatch${i}'}
            type="text"
            value={task.match || ''}
            className="form-control input-sm"
            onChange={this.handleChangeMatch('match')}
          />
        </div>

        {task.command === 'upload' || task.command === null ?
          <div className="col-xs-4">
            <small>Upload to</small>
          {pop ?
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={Upload}
            >
              <i className="fa fa-question-circle-o m-l-sm"></i>
            </OverlayTrigger>
          : null}
            <input
              placeholder="write your Rinocloud folder"
              type="text"
              value={task.args || ''}
              className="form-control input-sm"
              onChange={this.handleChangeMatch('args')}
            />
          </div>
        : null}

        {task.command === 'copy' ?
          <div className="col-xs-4">
            <small> Destination folder </small>
          {pop ?
            <OverlayTrigger
              trigger={['hover']}
              placement="bottom"
              overlay={Copy}
            >
              <i className="fa fa-question-circle-o m-l-sm"></i>
            </OverlayTrigger>
        : null}
            <input
              type="text"
              value={task.args || ''}
              className="form-control input-sm"
              onChange={this.handleChangeMatch('args')}
            />
          </div>
        : null}

      {['python', 'Rscript', 'matlab'].includes(task.command) ?
        <div className="col-xs-4">
          <div>
            <small>Select {task.command} file</small>
        {pop ?
          <OverlayTrigger
            trigger={['hover']}
            placement="bottom"
            overlay={Select}
          >
            <i className="fa fa-question-circle-o m-l-sm"></i>
          </OverlayTrigger>
        : null}
          </div>
          <a
            href="#"
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
                const paths = dialog.showOpenDialog({ properties: ['openFile'] }) // eslint-disable-line
              if (paths) {
                console.log(paths[0])
                this.handleChangeMatch('args')(e, paths[0])
              }
            }}
          >Select file</a>

        </div>
        : null}

        {task.command === 'custom' ?
          <div>
            <div className="col-xs-2">
              <small> Insert command to run</small>
           {pop ?
             <OverlayTrigger
               trigger={['hover']}
               placement="bottom"
               overlay={CommandRun}
             >
               <i className="fa fa-question-circle-o m-l-sm"></i>
             </OverlayTrigger>
          : null}
              <input
                type="text"
                value={task.command || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('command')}
              />
            </div>
            <div className="col-xs-4">
              <small> Insert command argument</small>
              {pop ?
                <OverlayTrigger
                  trigger={['hover']}
                  placement="bottom"
                  overlay={Argument}
                >
                  <i className="fa fa-question-circle-o m-l-sm"></i>
                </OverlayTrigger>
              : null}
              <input
                type="text"
                value={task.args || ''}
                className="form-control input-sm"
                onChange={this.handleChangeMatch('args')}
              />
            </div>
          </div>
        : null}

        <div className="col-xs-1 pull-right">
          <button
            className="task-remove-button btn btn-xs btn-danger"
            onClick={this.handleRemoveClick}
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
          {task.command === 'upload' ?
            <div className="col-xs-12 text-muted m-t">
            Rinocloud-upload saves automatically your inside folder in your Rinocloud
            </div>
            : null}
          {task.command === 'copy' ?
            <div className="col-xs-12 text-muted m-t">
              COPY
            </div>
            : null}
          {task.command === 'matlab' ?
            <div className="col-xs-12 text-muted m-t">
            MATLAB
            </div>
            : null}
            {task.command === 'python' ?
              <div className="col-xs-12 text-muted m-t">
              Python
              </div>
              : null}
            {task.command === 'Rscript' ?
              <div className="col-xs-12 text-muted m-t">
              R
              </div>
              : null}
            {task.command === 'custom' ?
              <div className="col-xs-12 text-muted m-t">
              Custom
              </div>
              : null}
              {task.command === 'z' ?
                <div className="col-xs-12 text-muted m-t">
                  HEleejejladfsjda okj apdoad qapodkapskdja paoksdl;ads;ads
                  sdf apsodojdk
                  sdpk asd
                </div>
                : null}
              {task.command === installedPackages.packageName ?
                <div className="col-xs-12 text-muted m-t">
                packages
                </div>
                : null}
              {task.command === 'x' ?
                <div className="col-xs-12 text-muted m-t">
                HEleejejladfsjda okj apdoad qapodkapskdja paoksdl;ads;ads
                    sdf apsodojdk
                    sdpk asd
                </div>
                : null}
                {/*{installedPackages.map((packageName) =>
                 <div className="col-xs-12 text-muted m-t"
                    value={packageName}>
                    {packageName}asdasdasd
                    {packageName}
                  </div>
                )}*/}

      </div>
    )
  }
}

export { TaskForm }
