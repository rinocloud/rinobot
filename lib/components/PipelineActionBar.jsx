import React, { PropTypes } from 'react'
import { PipelineSaveButton } from '../components/PipelineSaveButton'
import { Button } from '../components/Button'

export const PipelineActionBar = (props) => {
  const { onClickRun, onSavePipeline } = props

  return (
    <div className="row row-task-faux">
      <div className="col-sm-10">
        <Button onClick={onClickRun} extraClassNames="btn-primary pull-right">
          Run
        </Button>
        <PipelineSaveButton onSubmit={onSavePipeline} />
      </div>
    </div>
  )
}

PipelineActionBar.propTypes = {
  onClickRun: PropTypes.func.isRequired,
  onSavePipeline: PropTypes.func.isRequired,
}
