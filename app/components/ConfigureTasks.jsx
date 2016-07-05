import React, { PropTypes } from 'react'


/*
  whats in config....

  uploadTo: ////
  metadata: object
  ignore:   list

  tasks: list
    - match:    pattern
    - plugin:   pluginName - autocompleted
    - command:  string of cli program
    - args:     string which can ref the metadata
    - on:       event
*/


export class ConfigureTasks extends React.Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    onSetConfig: PropTypes.func.isRequired,
    installedPackages: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()
    console.log(this.$uploadTo.value)
    console.log(this.$plugin.value)
  }

  render() {
    return (
      <div className="m-t">
        <div className="row">
          <div className="col-sm-12">
            <strong>Config</strong>
          </div>
        </div>

        <div className="row">
          <form className="col-sm-5" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label>upload to a directory on rinocloud</label>
              <input
                type="text"
                ref={(c) => { this.$uploadTo = c }}
                className="form-control"
                placeholder="some/folder"
              />
            </div>

            {/*<div className="form-group">
              <label>plugin</label>
              <select ref={(c) => { this.$plugin = c }}>
                {this.props.installedPackages.map((o, i) =>
                  <option key={`o${i}`}>{o.name}</option>
                )}
              </select>
            </div>*/}

            <input type="submit" className="btn btn-primary" value="Set config" />

          </form>
        </div>
      </div>
    )
  }

}
