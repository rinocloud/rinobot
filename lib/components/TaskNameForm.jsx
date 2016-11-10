import React, { PropTypes } from 'react'
import Select from 'react-select-plus'

export class TaskNameForm extends React.Component {
  static propTypes = {
    installedPlugins: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool
  }

  buildSelectBoxOpts() {
    const { installedPlugins } = this.props

    const selectBoxOptions = [
      {
        label: 'Default',
        options: [
          // { label: 'rinocloud upload', value: 'upload' },
          // { label: 'copy', value: 'copy' },
          // { label: 'move', value: 'move' },
          { label: 'matlab', value: 'matlab' },
          { label: 'python', value: 'python' },
          { label: 'Rscript', value: 'Rscript' },
          // { label: 'custom', value: 'custom' },
        ]
      },
      {
        label: (
          <span>
          Plugins:
            <small className="text-muted m-l">Installed plugins appear here</small>
          </span>
        ),
        options: installedPlugins.map((dep) => ({
          label: dep.name.replace('rinobot-plugin-', ''),
          value: dep.name
        }))
      }
    ]

    return selectBoxOptions
  }

  render() {
    const {
      value,
      onChangeName,
      isDisabled = false
    } = this.props

    const selectBoxOptions = this.buildSelectBoxOpts()

    return (
      <Select
        type="text"
        value={value || ''}
        options={selectBoxOptions}
        onChange={(item) => {
          if (item) onChangeName(item.value)
          else onChangeName(null)
        }}
        placeholder="Select task..."
        disabled={isDisabled}
      />
    )
  }

}

export default { TaskNameForm }
