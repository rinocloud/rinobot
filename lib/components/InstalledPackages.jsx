import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { shell } from 'electron'
import * as pluginsActions from '../actions/plugins'


class InstalledPackages extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.setSearchTerm = this.setSearchTerm.bind(this)
    this.clearSearchTerm = this.clearSearchTerm.bind(this)
    this.state = { searchTerm: null }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(pluginsActions.fetchRegistry())
  }

  setSearchTerm(e) {
    e.preventDefault()
    const val = e.target.searchInput.value
    this.setState({ searchTerm: val === '' ? null : val })
  }

  clearSearchTerm() {
    this.setState({ searchTerm: null })
  }

  render() {
    const { dispatch, plugins } = this.props
    let registry = _.map(plugins.pluginRegistry, p => ({
      ...p,
      isInstalled: _.includes(_.keys(plugins.config.dependencies), p.name)
    }))

    registry.sort((x, y) => { // eslint-disable-line
      return (x.isInstalled === y.isInstalled) ? 0 : x.isInstalled ? -1 : 1 // eslint-disable-line
    })

    if (this.state.searchTerm) {
      registry = _.filter(registry, plugin =>
        plugin.name.toLowerCase().indexOf(this.state.searchTerm) !== -1
      )
    }

    const openExternal = (e) => {
      e.preventDefault()
      shell.openExternal(e.target.href)
    }

    const onClickInstall = (plugin, index) => {
      dispatch(pluginsActions.install(plugin, index))
    }

    const onClickUninstall = (plugin, index) => {
      dispatch(pluginsActions.uninstall(plugin, index))
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12 row">
            <h2 className="lead">
              Plugins{'  '}
              {plugins.isSearching ?
                <small className="text-muted">
                  <i className="fa fa-spinner fa-spin"></i>
                  {'  '}checking for updates
                </small>
              : ''}
            </h2>
            <div className="col-sm-8">

              <div className="row m-b">

                <form className="form col-sm-8 p-a-0" onSubmit={this.setSearchTerm} >
                  <input
                    className="form-control"
                    name="searchInput"
                    type="text"
                    placeholder="Search for plugin"
                  />
                  <br />
                  <input type="submit" value="Search" className="btn btn-xs btn-primary" /> {'  '}
                  <a onClick={this.clearSearchTerm} className="btn btn-xs btn-default">Clear</a>
                </form>

              </div>
              <div className="row">
                {plugins.statusText}
              </div>

              {_.map(registry, (el, i) =>
                <div className="row" key={`plugin${i}`}>

                  <div>
                    <h4>{el.name.replace('rinobot-plugin-', '')}</h4>
                    {!el.isInstalled ?
                      <a
                        href="#"
                        className="btn btn-xs btn-primary"
                        onClick={(e) => {
                          e.preventDefault()
                          onClickInstall(el, i)
                        }}
                      >
                        {!el.isInstalling ? 'Install' : 'Installing'}
                      </a>
                      :
                      <a
                        href="#"
                        className="btn btn-xs btn-default"
                        onClick={(e) => {
                          e.preventDefault()
                          onClickUninstall(el, i)
                        }}
                      >
                        Uninstall
                      </a>
                    }
                  </div>

                  <div>{el.description}</div>

                  <small className="text-muted">
                    v{el['dist-tags'] ? el['dist-tags'].latest : ''}
                    {' '} updated by {el.author && el.author.name} {' '}
                    {el.time && moment(el.time.modified).fromNow()}
                  </small>

                  <hr />

                </div>
              )}
            </div>

            <div className="col-sm-4">
              <p className="m-t">
                <strong>Documentation/Guides</strong>
              </p>

              <ol className="m-t">
                <li>
                  <a
                    href="http://docs.rinocloud.com/rinobot/plugins/installing_a_plugin.html"
                    onClick={openExternal}
                  >
                    Detailed guide to installing a plugin
                  </a>
                </li>
                <li>
                  <a
                    href="http://docs.rinocloud.com/rinobot/tasks/running_your_own_programs.html"
                    onClick={openExternal}
                  >
                    Using your own programs
                  </a>
                </li>
                <li>
                  <a
                    href="http://docs.rinocloud.com/rinobot/plugins/creating_a_plugin.html"
                    onClick={openExternal}
                  >
                    Creating and sharing a plugin
                  </a>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  plugins: state.plugins
}))(InstalledPackages)
