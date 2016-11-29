import React, { PropTypes } from 'react'
import Select from 'react-select-plus'
import _ from 'lodash'


const optionRenderer = (props) => {
  return <option value={props.value}>{props.label}</option>
}

optionRenderer.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

export class LoadMetadataTemplate extends React.Component {
  static propTypes = {
    templates: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = { value: null }
  }

  render() {
    const { templates, onSelect } = this.props

    const selectBoxOptions = _.map(templates, (template, templateName) => ({
      label: templateName,
      value: templateName
    }))

    return (
      <Select
        type="text"
        value={this.state.value || ''}
        placeholder="Your templates..."
        options={selectBoxOptions}
        optionRenderer={optionRenderer}
        onChange={(item) => {
          if (item) {
            onSelect(templates[item.value])
            this.setState({ value: item.value })
          } else {
            this.setState({ value: null })
          }
        }}
      />
    )
  }

}
