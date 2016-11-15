import React, { PropTypes } from 'react'
import _ from 'lodash'
import { shell } from 'electron'
import { Popover, OverlayTrigger, Button } from 'react-bootstrap'

class TaskPopover extends React.Component {
  static propTypes = {
    currentPlugin: PropTypes.object,
  }

  render() {
    const { currentPlugin } = this.props

    const name = currentPlugin.name
    const options = currentPlugin.options

    const title = (
      <span>
        {name}
        <a
          href="#"
          className="pull-right"
          onClick={(e) => {
            e.preventDefault()
            shell.openExternal(currentPlugin.homepage)
          }}
        >
          <i className="fa fa fa-book"></i>{'  '}
          <span>Plugin docs</span>
        </a>
      </span>
    )


    const popover = (
      <Popover
        style={{ minWidth: '400px' }}
        id="popover-trigger-click-root-close"
        title={title}
      >
        {_.map(options, (option, optionName) => {
          const { type, description, required = false } = option
          return (
            <p key={`opts${optionName}`}>
              {optionName} [{type}{required && ' - required'}]: {description}
            </p>
          )
        })}
      </Popover>
      )
    return (
      <div>
        {currentPlugin.options && !_.isEmpty(currentPlugin.options) &&
          <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={popover}
            rootClose
          >
            <Button style={{ marginTop: '3px' }}>
              <i className="fa fa-question-circle-o" />
            </Button>
          </OverlayTrigger>
        }
      </div>
    )
  }
}
export { TaskPopover }
