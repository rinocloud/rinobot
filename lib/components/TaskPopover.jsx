import React, { PropTypes } from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger, Button } from 'react-bootstrap'

class TaskPopover extends React.Component {
  static propTypes = {
    currentPlugin: PropTypes.object,
  }

  render() {
    const {
      currentPlugin,
     } = this.props

    const name = currentPlugin.name
    const options = currentPlugin.options

    const popover = (
      <Popover
        style={{ minWidth: '400px' }}
        id="popover-trigger-click-root-close"
        title={name}
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
            rootClose placement="bottom"
            overlay={popover}
          >
            <Button> <i className="fa fa-question-circle-o" /> </Button>
          </OverlayTrigger>
        }
      </div>
    )
  }
}
export { TaskPopover }
