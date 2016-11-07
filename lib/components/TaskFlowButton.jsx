import React, { PropTypes } from 'react'
import { Button } from './Button'

export const TaskFlowButton = (props) => {
  const {
    flow,
    onClickFlow,
    index
  } = props

  const thenClass = `btn-flow ${flow === 'then' ? 'active' : ''}`
  const andClass = `btn-flow ${flow === 'and' ? 'active' : ''}`

  return (
    <span>
      <Button className={thenClass} onClick={() => onClickFlow(index, 'then')}>
        THEN
      </Button>
      <Button className={andClass} onClick={() => onClickFlow(index, 'and')}>
        AND
      </Button>
    </span>
  )
}

TaskFlowButton.propTypes = {
  flow: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onClickFlow: PropTypes.func.isRequired
}

export default { TaskFlowButton }
