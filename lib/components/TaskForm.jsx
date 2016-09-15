import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'

import Select from 'react-select-plus'

class TaskForm extends React.Component {

  static propTypes = {
    registry: PropTypes.array,
    packagesConfig: PropTypes.object,
    name: PropTypes.string,
    args: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
    onChangeName: PropTypes.func.isRequired,
    onChangeArgs: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }


  render() {
    const { name, args, registry, packagesConfig } = this.props //eslint-disable-line

    let installDeps = []
    if (packagesConfig && packagesConfig.dependencies) {
      installDeps = _.keys(packagesConfig.dependencies).map((dep) => ({
        label: dep.replace('rinobot-plugin-', ''),
        value: dep
      }))
    }

    const commandList = [
      { name: 'rinocloud upload', value: 'upload' },
      { name: 'copy', value: 'copy' },
      { name: 'move', value: 'move' },
      { name: 'matlab', value: 'matlab' },
      { name: 'python', value: 'python' },
      { name: 'Rscript', value: 'Rscript' },
      { name: 'custom', value: 'custom' },
      ...installDeps
    ]

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
        !_.map(commandList, 'value').includes(name) ||
        name === 'custom'
      ) && name !== null
    )


    const isPluginCommand = _.map(installDeps, 'value').includes(name)

    let pluginReadme = null
    const pluginDetails = _.find(registry, { name })
    if (pluginDetails) {
      pluginReadme = pluginDetails.homepage
    }

    let selectedValue = name || ''

    const changeArgs = (e) => {
      e.preventDefault()
      this.props.onChangeArgs(e.target.value)
    }

    const changeName = (item) => {
      if (item) this.props.onChangeName(item.value)
      else this.props.onChangeName(null)
    }

    return (
      <div className="row m-l m-t">
        <div className="col-xs-4">
          <Select
            type="text"
            value={selectedValue || ''}
            options={selectOpts}
            onChange={changeName}
            placeholder="Select automation..."
          />
        </div>

        {name === 'upload' &&
          <div className="col-xs-3">
            <input
              placeholder="target folder in rinocloud"
              type="text"
              value={args || ''}
              className="form-control input-sm"
              onChange={changeArgs}
            />
          </div>
        }

        {['copy', 'move'].includes(name) &&
          <div className="col-xs-5">
            <div className="col-xs-2">
              <button
                className="btn btn-sm btn-default"
                style={{ border: 'none' }}
              >
                to
              </button>
            </div>
            <div className="col-xs-4">
              <a
                href="#"
                className="btn btn-default btn-sm"
                onClick={(e) => {
                  e.preventDefault()
                  const paths = dialog.showOpenDialog({ properties: ['openDirectory'] }) // eslint-disable-line
                  if (paths) {
                    changeArgs(e, paths[0])
                  }
                }}
              >
                Select folder
              </a>
            </div>
            <div className="col-xs-6">
              <input
                type="text"
                value={args || ''}
                className="form-control input-sm"
                onChange={changeArgs}
                placeholder="or type a location"
              />
            </div>
          </div>
        }

        {['python', 'Rscript', 'matlab'].includes(name) &&
          <div className="col-xs-4">
            <a
              href="#"
              className="btn btn-default btn-sm"
              onClick={(e) => {
                e.preventDefault()
                const paths = dialog.showOpenDialog({ properties: ['openFile'] }) // eslint-disable-line
                if (paths) {
                  changeArgs('args')(e, paths[0])
                }
              }}
            >
              Select {name === 'Rscript' ? 'R' : name} file
              {args ? ` (${pt.basename(args)})` : ''}
            </a>
          </div>
        }

        {isCustomCommand &&
          <div>
            <div className="col-xs-2">
              <input
                type="text"
                value={name || ''}
                placeholder="Command to run"
                className="form-control input-sm"
                onChange={(e) => {
                  e.preventDefault()
                  changeName({ value: e.target.value })
                }}
              />
            </div>
            <div className="col-xs-3">
              <input
                type="text"
                value={args || ''}
                placeholder="Command arguments"
                className="form-control input-sm"
                onChange={changeArgs}
              />
            </div>
          </div>
        }

        {isPluginCommand &&
          <div className="col-xs-5">
            <input
              type="text"
              placeholder="extra parameters for plugin"
              value={args || ''}
              className="form-control input-sm"
              onChange={changeArgs}
            />
          </div>
        }

        <div className="col-xs-2">
          <a
            href="#"
            className="m-l"
            onClick={(e) => {
              e.preventDefault()
              this.props.onRemove()
            }}
          >
            remove task
          </a>
        </div>
      </div>
    )
  }
}

export { TaskForm }
