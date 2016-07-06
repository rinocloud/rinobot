import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
const { dialog } = require('electron').remote;

import { PluginResultList } from './PluginResultList'
import * as pluginsActions from '../actions/plugins'


export class Plugins extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.handleDownloadClick = this.handleDownloadClick.bind(this)
    this.handleChooseFolder = this.handleChooseFolder.bind(this)
    this.handleSearchClick = this.handleSearchClick.bind(this)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(pluginsActions.doSearch(''))
  }

  handleDownloadClick(plugin, i) {
    const { dispatch } = this.props
    dispatch(pluginsActions.downloadPackage(plugin, i))
  }

  handleChooseFolder(e) {
    const { dispatch } = this.props
    e.preventDefault()
    const path = dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (path) {
      dispatch(pluginsActions.installLocalPackage(path[0]))
    }
  }

  handleSearchClick(e) {
    const { dispatch } = this.props
    e.preventDefault()
    dispatch(pluginsActions.doSearch(this.$input.value))
  }

  render() {
    const { plugins } = this.props

    return (
      <div className="container">
        <div className="row m-t">
          <div className="col-sm-12">
            <input
              type="text"
              className="form-control"
              ref={(c) => { this.$input = c }}
              placeholder="Search for rinobot plugins"
            />
            <a href="#" className="m-t btn btn-primary" onClick={this.handleSearchClick}>
              {plugins.isSearching ?
                <span>Searching <i className="fa fa-spinner fa-spin"></i></span>
                :
                'Search'
              }
            </a>

            <a href="#" className="m-t m-l btn btn-default" onClick={this.handleChooseFolder}>
              Install from directory
            </a>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            {plugins.statusText}
          </div>
        </div>

        <div className="row m-t">
          <div className="col-sm-12">
            <PluginResultList
              pluginsList={plugins.searchResults}
              onClickDownload={this.handleDownloadClick}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default connect((state) => ({
  plugins: state.plugins
}))(Plugins)
