import React, { PropTypes } from 'react'
import _ from 'lodash'
import Select from 'react-select-plus'

class OptionForm extends React.Component {

  static propTypes = {
    currentPlugin: PropTypes.object,
    onChangeArgs: PropTypes.func.isRequired,
    args: PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
  }

  render() {
    const { args, currentPlugin } = this.props

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
        <div className="col-xs-12">
          {_.map(sortedPluginOptionsList, (pluginOption, optionIndex) => {
            const {
              description, // eslint-disable-line
              type,
              allowed = [],
              required,
              optionName
            } = pluginOption

            const value = args && args[optionName] || ''

            const selectOpts = _.map(allowed, item => {
              return { label: item, value: item }
            })

            const requiredOptionName = (
              <div className="m-l-sm">
                {optionName}<small> (required) </small>
              </div>
            )

            if (type === 'string' && required && allowed.length > 0) {
              return (
                <div key={`opts${optionIndex}`} className="col-xs-4">
                  <Select
                    style={
                      value === '' ?
                        {
                          height: '36px',
                          borderRadius: '4px',
                          borderColor: '#d9534f',
                          borderSize: '5px'
                        }
                        :
                        {
                          height: '36px',
                          borderRadius: '4px',
                          borderColor: '#49925d',
                          borderSize: '5px'
                        }
                    }
                    type="text"
                    placeholder={requiredOptionName}
                    value={value}
                    options={selectOpts}
                    onChange={(item) => {
                      this.props.onChangeArgs(optionName, item ? item.value : null)
                    }}
                  />
                </div>
                )
            }

            if (type === 'string' && allowed.length > 0) {
              return (
                <div key={`opts${optionIndex}`} className="col-xs-4">
                  <Select
                    style={{ height: '36px', borderRadius: '4px', borderColor: '#fff' }}
                    type="text"
                    placeholder={optionName}
                    value={value}
                    options={selectOpts}
                    onChange={(item) => {
                      this.props.onChangeArgs(optionName, item ? item.value : null)
                    }}
                  />
                </div>
                )
            }

            if (type === 'string' && required) {
              return (
                <div key={`opts${optionIndex}`} className="col-xs-4">
                  <input
                    style={
                      value === '' ?
                        {
                          height: '36px',
                          borderRadius: '4px',
                          borderColor: '#d9534f',
                          borderSize: '5px'
                        }
                        :
                        {
                          height: '36px',
                          borderRadius: '4px',
                          borderColor: '#49925d',
                          borderSize: '5px'
                        }
                    }
                    type="text"
                    placeholder={requiredOptionName}
                    value={value}
                    className="form-control input-sm"
                    onChange={(e) => {
                      this.props.onChangeArgs(optionName, e.target.value)
                    }}
                  />
                </div>
                )
            }

            if (type === 'string') {
              return (
                <div key={`opts${optionIndex}`} className=" col-xs-4">
                  <input
                    style={{ height: '36px', borderRadius: '4px', borderColor: '#fff' }}
                    type="text"
                    placeholder={optionName}
                    value={value}
                    className="form-control input-sm"
                    onChange={(e) => {
                      this.props.onChangeArgs(optionName, e.target.value)
                    }}
                  />
                </div>
                )
            }

            console.log(value)

            if ((type === 'int' || type === 'float') && required) {
              return (
                <div key={`opts${optionIndex}`} className="col-xs-4">
                  <input
                    className="form-control input-sm"
                    style={
                      value === '' ?
                        {
                          height: '36px',
                          borderRadius: '4px',
                          borderColor: '#d9534f',
                          borderSize: '5px'
                        }
                        :
                        {
                          height: '36px',
                          borderRadius: '4px',
                          borderColor: '#49925d',
                          borderSize: '5px'
                        }
                    }
                    type="number"
                    placeholder={`${optionName} (required)`}
                    value={value}
                    onChange={(e) => {
                      this.props.onChangeArgs(optionName, e.target.value)
                    }}
                  />
                </div>
              )
            }
            if (type === 'int' || type === 'float') {
              return (
                <div key={`opts${optionIndex}`} className="col-xs-4">
                  <input
                    style={{ height: '36px', borderRadius: '4px', borderColor: '#fff' }}
                    type="number"
                    placeholder={optionName}
                    value={value}
                    className="form-control input-sm"
                    onChange={(e) => {
                      this.props.onChangeArgs(optionName, e.target.value)
                    }}
                  />
                </div>
              )
            }

            if (type === 'bool' && required && value === '') {
              return (
                <div
                  className="config-checkbox col-xs-2"
                  style={{ color: '#d9534f', fontSize: '1em' }}
                  style={
                    value === '' ?
                      { color: '#d9534f', fontSize: '1em' }
                      : null
                  }
                  key={`opts${optionIndex}`}
                >
                  {optionName}{'  '}
                  <input

                    type="checkbox"
                    onChange={(e) => {
                      this.props.onChangeArgs(optionName, e.target.checked)
                    }}
                    defaultChecked={value}
                  />
                </div>
              )
            }

            if (type === 'bool' && required && args[optionName]) {
              return (
                <div key={`opts${optionIndex}`} className="config-checkbox col-xs-2">
                  {optionName}{'  '}
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      this.props.onChangeArgs(optionName, e.target.checked)
                    }}
                    defaultChecked={value}
                  />
                </div>
              )
            }
            if (type === 'bool') {
              return (
                <div key={`opts${optionIndex}`} className="config-checkbox col-xs-2">
                  {optionName}{'  '}
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      this.props.onChangeArgs(optionName, e.target.checked)
                    }}
                    defaultChecked={value}
                  />
                </div>
              )
            }
          })
        }
        </div>
      </div>
  )
  }
  }
export { OptionForm }
