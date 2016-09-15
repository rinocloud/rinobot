import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'

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
        name: dep.replace('rinobot-plugin-', 'plugin: '),
        value: dep
      }))
    }

    const commandList = [
      { name: 'select an automation', value: null },
      { name: 'rinocloud upload', value: 'upload' },
      { name: 'copy', value: 'copy' },
      { name: 'move', value: 'move' },
      { name: 'matlab', value: 'matlab' },
      { name: 'python', value: 'python' },
      { name: 'Rscript', value: 'Rscript' },
      { name: 'custom', value: 'custom' },
      ...installDeps
    ]

    const isCustomCommand = (
      !_.map(commandList, 'value').includes(name) ||
      name === 'custom'
    )

    const isPluginCommand = _.map(installDeps, 'value').includes(name)

    let pluginReadme = null
    const pluginDetails = _.find(registry, { name })
    if (pluginDetails) {
      pluginReadme = pluginDetails.homepage
    }

    let selectedValue = name || ''
    if (isCustomCommand) {
      selectedValue = 'custom'
    }

    const changeArgs = (e) => {
      e.preventDefault()
      this.props.onChangeArgs(e.target.value)
    }

    const changeName = (e) => {
      e.preventDefault()
      this.props.onChangeName(e.target.value)
    }

    return (
      <div className="row m-l m-t">
        <div className="col-xs-3">
          <select
            type="text"
            value={selectedValue || ''}
            className="form-control"
            onChange={changeName}
          >
            {commandList.map((c) =>
              <option key={c.value} value={c.value}>
                {c.name}
              </option>
            )}
          </select>
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
                value={name !== 'custom' ? name : ''}
                placeholder="Command to run"
                className="form-control input-sm"
                onChange={changeName}
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
