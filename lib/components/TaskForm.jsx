import React, { PropTypes } from 'react'
import _ from 'lodash'
import pt from 'path'
import Select from 'react-select-plus'

class TaskForm extends React.Component {

  static propTypes = {
    registry: PropTypes.array,
    installedPlugins: PropTypes.array,
    name: PropTypes.string,
    args: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
    onChangeName: PropTypes.func.isRequired,
    onChangeArgs: PropTypes.func.isRequired,
    onChangeKeep: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }


  render() {
    const { name, args, keep, registry, installedPlugins } = this.props //eslint-disable-line

    const changeArgs = (e) => {
      e.preventDefault()
      this.props.onChangeArgs(e.target.value)
    }

    const changeName = (item) => {
      if (item) this.props.onChangeName(item.value)
      else this.props.onChangeName(null)
    }

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

    console.log(isCustomCommand)

    const isPluginCommand = _.map(installDeps, 'value').includes(name)
    const selectedValue = name || ''

    // now have access to the options of each installed plugin
    _.each(installedPlugins, (i) => console.log(i.name, i.options))

    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="row">

            <div className="col-xs-4">
              <div>
                <Select
                  type="text"
                  value={selectedValue || ''}
                  options={selectOpts}
                  onChange={changeName}
                  placeholder="Select automation..."
                />
              </div>
            </div>

            {selectedValue &&
              <div className="col-xs-5">
                {isPluginCommand &&
                  <input
                    style={{ borderRadius: '4px' }}
                    type="text"
                    placeholder="extra parameters for plugin"
                    value={args || ''}
                    className="form-control input-sm"
                    onChange={changeArgs}
                  />
                }

                {name === 'upload' &&
                  <input
                    style={{ borderRadius: '4px' }}
                    placeholder="target folder in rinocloud"
                    type="text"
                    value={args || ''}
                    className="form-control input-sm"
                    onChange={changeArgs}
                  />
                }

                {['copy', 'move'].includes(name) &&
                  <div className="form-group m-b-0">
                    <div className="input-group">
                      <span
                        className="input-group-addon"
                        style={{ backgroundColor: 'white' }}
                      >
                        <a

                          href="#"
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
                      </span>
                      <input
                        type="text"
                        value={args || ''}
                        className="form-control"
                        onChange={changeArgs}
                        placeholder="or type a location"
                      />
                    </div>
                  </div>
                }

                {['python', 'Rscript', 'matlab'].includes(name) &&
                  <a
                    style={{ borderRadius: '4px' }}
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
                }

                {isCustomCommand &&
                  <div>
                    <div className="col-xs-6">
                      <input
                        style={{ borderRadius: '4px' }}
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
                    <div className="col-xs-6">
                      <input
                        style={{ borderRadius: '4px' }}
                        type="text"
                        value={args || ''}
                        placeholder="Command arguments"
                        className="form-control input-sm"
                        onChange={changeArgs}
                      />
                    </div>
                  </div>
                }
              </div>
            }

            {selectedValue && isPluginCommand &&
              <div className="col-xs-2">
                <div className="text-muted config-checkbox">
                  save output{'  '}
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

            <div
              className={
                selectedValue ? // eslint-disable-line
                  isPluginCommand ?
                  'col-xs-1' : 'col-xs-1 col-xs-offset-2'
                  : 'col-xs-1 col-xs-offset-7'
              }
            >
              <a
                href="#"
                className="task-position-x-file"
                onClick={(e) => {
                  e.preventDefault()
                  this.props.onRemove()
                }}
              >
                <i className="fa fa-remove btn-red-x"></i>
              </a>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export { TaskForm }
