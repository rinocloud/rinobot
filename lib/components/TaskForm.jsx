import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'
import Select from 'react-select-plus'

class TaskForm extends React.Component {

  static propTypes = {
    isDisabled: PropTypes.bool.isRequired,
    registry: PropTypes.array,
    installedPlugins: PropTypes.array,
    name: PropTypes.string,
    args: PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
    onChangeName: PropTypes.func.isRequired,
    onChangeArgs: PropTypes.func.isRequired,
    onChangeKeep: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    showRemove: PropTypes.bool.isRequired,
  }

  changeName(item) {
    if (item) this.props.onChangeName(item.value)
    else this.props.onChangeName(null)
  }

  changeArgs(e) {
    e.preventDefault()
    this.props.onChangeArgs('default', e.target.value)
  }

  render() {
    const { name, args, keep, registry, installedPlugins, isDisabled } = this.props

    const installDeps = installedPlugins.map((dep) => ({
      label: dep.name.replace('rinobot-plugin-', ''),
      value: dep.name
    }))

    const selectOpts = [
      {
        label: 'Default',
        options: [
          { label: 'rinocloud upload', value: 'upload' },
          { label: 'copy', value: 'copy' },
          { label: 'move', value: 'move' },
          { label: 'matlab', value: 'matlab' },
          { label: 'python', value: 'python' },
          { label: 'Rscript', value: 'Rscript' },
          { label: 'custom', value: 'custom' },
        ]
      },
      {
        label: (
          <span>
          Plugins:
            <small className="text-muted m-l">Installed plugins appear here</small>
          </span>
        ),
        options: installDeps
      }
    ]

    const isCustomCommand = (
      (
        !_.map(selectOpts[0].options, 'value').includes(name) &&
        !_.map(installDeps, 'value').includes(name) &&
        name !== null
      ) ||
      name === 'custom'
    )

    const isPluginCommand = _.map(installDeps, 'value').includes(name)
    const selectedValue = name || ''

    const currentPlugin = _.find(installedPlugins, {
      name: selectedValue
    })

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
        <div className="col-xs-4">
          <Select
            type="text"
            value={selectedValue || ''}
            options={selectOpts}
            onChange={this.changeName}
            placeholder="Select task..."
            disabled={isDisabled}
          />
        </div>

        <div className="col-xs-6">
          {selectedValue && isPluginCommand &&
            _.map(sortedPluginOptionsList, (pluginOption, optionIndex) => {
              const {
                description, // eslint-disable-line
                type,
                allowed = [],
                required,
                optionName
              } = pluginOption

              const value = args[optionName] || ''

              const selectOpts = _.map(allowed, item => {
                return { label: item, value: item }
              })

              if (type === 'string' && required && allowed.length > 0) {
                return (
                  <div key={`opts${optionIndex}`} className="col-xs-4">
                    <Select
                      style={{ height: '36px', borderRadius: '4px' }}
                      type="text"
                      value={value}
                      options={selectOpts}
                      onChange={(item) => {
                        this.props.onChangeArgs(optionName, item.value)
                      }}
                      placeholder={optionName}
                      disabled={isDisabled}
                    />
                  </div>
                  )
              }

              if (type === 'string' && required) {
                return (
                  <div key={`opts${optionIndex}`} className="col-xs-4">
                    <input
                      style={{ height: '36px', borderRadius: '4px' }}
                      type="text"
                      placeholder={optionName}
                      value={value}
                      className="form-control input-sm"
                      onChange={(e) => {
                        this.props.onChangeArgs(optionName, e.target.value)
                      }}
                      disabled={isDisabled}
                    />*required string
                  </div>
                  )
              }

              if (type === 'string' && allowed.length > 0) {
                return (
                  <div key={`opts${optionIndex}`} className="col-xs-4 select-parent">
                    <Select
                      style={{ height: '36px', borderRadius: '4px' }}
                      type="text"
                      value={value}
                      options={selectOpts}
                      onChange={(item) => {
                        this.props.onChangeArgs(optionName, item.value)
                      }}
                      disabled={isDisabled}
                      placeholder={optionName}
                    />
                  </div>
                  )
              }

              if (type === 'string') {
                return (
                  <div key={`opts${optionIndex}`} className="col-xs-4">
                    <input
                      style={{ height: '36px', borderRadius: '4px' }}
                      type="text"
                      placeholder={optionName}
                      value={value}
                      className="form-control input-sm"
                      onChange={(e) => {
                        this.props.onChangeArgs(optionName, e.target.value)
                      }}
                      disabled={isDisabled}
                    />
                  </div>
                  )
              }

              if (type === 'int' || type === 'float' && required) {
                return (
                  <div key={`opts${optionIndex}`} className="col-xs-4">
                    <input
                      style={{ height: '36px', borderRadius: '4px' }}
                      type="number"
                      placeholder={optionName}
                      value={value}
                      className="form-control input-sm"
                      onChange={(e) => {
                        this.props.onChangeArgs(optionName, e.target.value)
                      }}
                      disabled={isDisabled}
                    />
                  </div>
                )
              }

              if (type === 'int' || type === 'float') {
                return (
                  <div key={`opts${optionIndex}`} className="col-xs-3">
                    <input
                      style={{ height: '36px', borderRadius: '4px' }}
                      type="number"
                      placeholder={optionName}
                      value={value}
                      className="form-control input-sm"
                      onChange={(e) => {
                        this.props.onChangeArgs(optionName, e.target.value)
                      }}
                      disabled={isDisabled}
                    />
                  </div>
                )
              }

              if (type === 'bool' && required) {
                return (
                  <div key={`opts${optionIndex}`} className="config-checkbox col-xs-3">
                    {optionName}{'  '}
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        this.props.onChangeArgs(optionName, e.target.checked)
                      }}
                      defaultChecked={value}
                      disabled={isDisabled}
                    /> *required bool
                  </div>
                )
              }

              if (type === 'bool') {
                return (
                  <div key={`opts${optionIndex}`} className="config-checkbox col-xs-3">
                    {optionName}{'  '}
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        this.props.onChangeArgs(optionName, e.target.checked)
                      }}
                      defaultChecked={value}
                      disabled={isDisabled}
                    />
                  </div>
                )
              }
            })
          }

          {selectedValue && name === 'upload' &&
            <input
              style={{ height: '36px', borderRadius: '4px' }}
              placeholder="target folder in rinocloud"
              type="text"
              value={args.default || ''}
              className="form-control input-sm"
              onChange={this.changeArgs}
              disabled={isDisabled}
            />
          }

          {selectedValue && ['copy', 'move'].includes(name) &&
            <div className="form-group m-b-0">
              <div className="input-group">
                <span
                  style={{ height: '36px', borderRadius: '4px', lineHeight: '36px' }}
                  className="input-group-addon"
                  style={{ backgroundColor: 'white' }}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      const paths = dialog.showOpenDialog({ properties: ['openDirectory'] }) // eslint-disable-line
                      if (paths) {
                        this.changeArgs(e, paths[0])
                      }
                    }}
                    disabled={isDisabled}
                  >
                    Select folder
                  </a>
                </span>
                <input
                  style={{ height: '36px', borderRadius: '4px' }}
                  type="text"
                  value={args.default || ''}
                  className="form-control"
                  onChange={this.changeArgs}
                  placeholder="or type a location"
                  disabled={isDisabled}
                />
              </div>
            </div>
          }

          {selectedValue && ['python', 'Rscript', 'matlab'].includes(name) &&
            <a
              style={{ height: '36px', borderRadius: '4px' }}
              href="#"
              className="btn btn-default btn-sm"
              onClick={(e) => {
                e.preventDefault()
                const paths = dialog.showOpenDialog({ properties: ['openFile'] }) // eslint-disable-line
                if (paths) {
                  this.changeArgs('args')(e, paths[0])
                }
              }}
              disabled={isDisabled}
            >
              Select {name === 'Rscript' ? 'R' : name} file
              {args ? ` (${pt.basename(args)})` : ''}
            </a>
          }

          {selectedValue && isCustomCommand &&
            <div>
              <div className="col-xs-6">
                <input
                  style={{ height: '36px', borderRadius: '4px' }}
                  type="text"
                  value={name || ''}
                  placeholder="Command to run"
                  className="form-control input-sm"
                  onChange={(e) => {
                    e.preventDefault()
                    this.changeName({ value: e.target.value })
                  }}
                  disabled={isDisabled}
                />
              </div>
              <div className="col-xs-6">
                <input
                  style={{ height: '36px', borderRadius: '4px' }}
                  type="text"
                  value={args.default || ''}
                  placeholder="Command arguments"
                  className="form-control input-sm"
                  onChange={this.changeArgs}
                  disabled={isDisabled}
                />
              </div>
            </div>
          }
        </div>

        {selectedValue && isPluginCommand &&
          <div className="col-xs-2">
            <div className="text-muted config-checkbox">
              keep file{'  '}
              <input
                type="checkbox"
                onChange={(e) => {
                  this.props.onChangeKeep(e.target.checked)
                }}
                defaultChecked={keep}
              />
            </div>
          </div>
        }

        {this.props.showRemove &&
          <a
            href="#"
            className="btn-remove-task"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
            disabled={isDisabled}
          >
            <i className="fa fa-remove btn-red-x"></i>
          </a>
        }
      </div>
    )
  }
}

export { TaskForm }
