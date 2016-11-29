import React, { PropTypes } from 'react'
import { Popover as BootstrapPopover, OverlayTrigger } from 'react-bootstrap'

export const Popover = (props) => {
  const popover = (
    <BootstrapPopover
      id="popover-trigger-click-root-close"
    >
      {props.text}
    </BootstrapPopover>
  )

  const children = props.children || <i className="fa fa-question-circle-o m-l-sm" />

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="bottom"
      overlay={popover}
      rootClose
    >
      {children}
    </OverlayTrigger>
  )
}

Popover.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.node
}

export default { Popover }
