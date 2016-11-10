import React, { PropTypes } from 'react'
import { Prompt } from '../components/Prompt'
import { Button } from '../components/Button'

export const PipelineActionBar = (props) => {
  const { onClickRun, onSavePipeline } = props

  return (
    <div className="row row-task-faux">
      <div className="col-sm-10">
        <Button onClick={onClickRun} extraClassNames="btn-primary pull-right">
          Run
        </Button>
        <Prompt
          onSubmit={onSavePipeline}
          extraClassNames="pull-right m-r-sm"
          placeholder="Name for task list..."
        >
          Save
        </Prompt>
      </div>
    </div>
  )
}

PipelineActionBar.propTypes = {
  onClickRun: PropTypes.func.isRequired,
  onSavePipeline: PropTypes.func.isRequired,
}
