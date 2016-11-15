import React from 'react'
import { shell } from 'electron'
import { Popover, OverlayTrigger } from 'react-bootstrap'

export const SnippetPopover = () => {
  const popover = (
    <Popover
      id="popover-trigger-click-root-close"
    >
      This opens a new python file in the current folder
      where you can quickly build some code to process files.
    </Popover>
  )

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="bottom"
      overlay={popover}
      rootClose
    >
      <i className="fa fa-question-circle-o m-l-sm" />
    </OverlayTrigger>
  )
}

export default { SnippetPopover }
