import React, { PropTypes } from 'react'
import _ from 'lodash'
import { TaskOptionFormItem } from './TaskOptionFormItem'

class TaskOptionForm extends React.Component {
  static propTypes = {
    currentPlugin: PropTypes.object,
    onChangeArgs: PropTypes.func.isRequired,
    optionsValue: PropTypes.object.isRequired
  }

  render() {
    const {
      optionsValue,
      currentPlugin,
      onChangeArgs
     } = this.props

    let pluginOptionsList = {}
    if (currentPlugin && currentPlugin.options) {
      pluginOptionsList = currentPlugin.options
    }

    const sortedPluginOptionsList = _.sortBy(
      _.map(pluginOptionsList, (value, key) => ({
        optionName: key,
        ...value
      }))
    , ['required'])

    return (
      <div className="row">
          {_.map(sortedPluginOptionsList, (pluginOption, optionIndex) => {
            return (
              <div className="task-option-form-item" key={`opts${optionIndex}`}>
                <TaskOptionFormItem
                  description={pluginOption.description}
                  type={pluginOption.type}
                  allowed={pluginOption.allowed}
                  required={pluginOption.required}
                  optionName={pluginOption.optionName}
                  optionsValue={optionsValue}
                  onChangeArgs={onChangeArgs}
                />
              </div>
            )
          })}
      </div>
    )
  }
}
export { TaskOptionForm }
