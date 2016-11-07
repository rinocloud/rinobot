import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'
import Select from 'react-select-plus'
import { OptionForm } from './OptionForm'

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

  constructor(props) {
    super(props)
    this.changeName = this.changeName.bind(this)
    this.changeArgs = this.changeArgs.bind(this)
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
    const { name, args, keep, registry, installedPlugins, isDisabled } = this.props //eslint-disable-line

    const installedPluginsLabels = installedPlugins.map((dep) => ({
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
        options: installedPluginsLabels
      }
    ]

    const isCustomCommand = (
      (
        !_.map(selectOpts[0].options, 'value').includes(name) &&
        !_.map(installedPluginsLabels, 'value').includes(name) &&
        name !== null
      ) ||
      name === 'custom'
    )

    const isCommandAPlugin = _.map(installedPluginsLabels, 'value').includes(name)

    const selectedValue = name || ''

    const currentPlugin = _.find(installedPlugins, {
      name: selectedValue
    })

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

        <div className="col-xs-9 m-t-sm">
        {selectedValue &&
          <div>
          {isCommandAPlugin &&
            <OptionForm
              currentPlugin={currentPlugin}
              args={args}
              onChangeArgs={this.props.onChangeArgs}
            />
          }
          {name === 'upload' &&
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

          {['copy', 'move'].includes(name) &&
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
                  type="text"
                  value={args.default || ''}
                  className="col-xs-4 copy-input"
                  onChange={this.changeArgs}
                  placeholder="or type a location"
                  disabled={isDisabled}
                />
              </div>
            </div>
          }

          {['python', 'Rscript', 'matlab'].includes(name) &&
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

          {isCustomCommand &&
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
        }
        </div>

        {isCommandAPlugin &&
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
