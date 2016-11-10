import React, { PropTypes } from 'react'
import Select from 'react-select-plus'
import _ from 'lodash'

export class LoadPipeline extends React.Component {
  static propTypes = {
    pipelines: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = { value: null }
  }

  render() {
    const { pipelines, onSelect } = this.props

    const selectBoxOptions = _.map(pipelines, (pipeline, pipelineName) => ({
      label: pipelineName,
      value: pipelineName
    }))

    return (
      <Select
        type="text"
        value={this.state.value || ''}
        placeholder="Your saved tasks..."
        options={selectBoxOptions}
        onChange={(item) => {
          if (item) {
            onSelect(pipelines[item.value])
            this.setState({ value: item.value })
          }
        }}
      />
    )
  }

}
