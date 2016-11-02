import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import semver from 'semver'
import _ from 'lodash'
import { shell } from 'electron'
import { Plugin } from '../components/Plugin'
import * as pluginsActions from '../actions/plugins'


class Plugins extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = { searchTerm: null }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(pluginsActions.fetchRegistry())
  }

  setSearchTerm(val) {
    this.setState({ searchTerm: val === '' ? null : val })
  }

  prepareRegistry() {
    const { plugins } = this.props

    const newRegistry = _.map(plugins.registry, (registryPlugin, index) => {
      const isInstalled = _.map(plugins.installed, 'name').includes(registryPlugin.name)
      let canUpdate = false
      if (isInstalled && registryPlugin.version) {
        const installedVersion = _.find(plugins.installed, { name: registryPlugin.name })
        const registryVersion = registryPlugin.version

        if (semver.validRange(installedVersion.version)) {
          canUpdate = semver.gtr(registryVersion, installedVersion.version)
        } else {
          canUpdate = semver.lt(installedVersion.version, registryVersion)
        }
      }

      return {
        ...registryPlugin,
        isInstalled,
        canUpdate,
        index
      }
    })

    newRegistry.sort((x, y) => {
      if (x.isInstalled === y.isInstalled) {
        if (x.downloads > y.downloads) {
          return -1
        }
        return 1
      }
      if (x.isInstalled) {
        return -1
      }
      return 1
    })

    return newRegistry
  }

  render() {
    const { dispatch, plugins } = this.props

    let filteredRegistry = this.prepareRegistry()
    if (this.state.searchTerm) {
      filteredRegistry = _.filter(plugins.registry, plugin =>
        plugin.name.toLowerCase().indexOf(this.state.searchTerm) !== -1
      )
    }

    return (
      <div>
        <div className="main config p-l p-r">
          <div className="row">
            <div className="col-sm-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <div className="row">
                    <div className="col-sm-6">
                      <form>
                        <input
                          className="form-control"
                          name="searchInput"
                          type="text"
                          placeholder="Search for plugin"
                          onChange={(e) => {
                            e.preventDefault()
                            const val = e.target.value
                            this.setSearchTerm(val)
                          }}
                        />
                      </form>
                    </div>
                    <div className="col-sm-6">
                      <small className="text-muted m-l-sm m-t-sm pull-right">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            shell.openExternal('http://docs.rinocloud.com/rinobot/plugins/installing_a_plugin.html')
                          }}
                        >
                          <i className="fa fa-external-link fa-small"></i>{'  '}
                          <span>Plugin docs</span>
                        </a>
                      </small>

                    {plugins.isSearching ?
                      <small className="text-muted m-l-sm m-r m-t-sm pull-right">
                        <i className="fa fa-spinner fa-spin"></i>
                        {'  '}checking for updates
                      </small>
                    : ''}
                    </div>
                  </div>
                </div>
                <div className="panel-body">
                  <table className="table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Plugin</th>
                        <th>Description</th>
                        <th>Downloads last month</th>
                      </tr>
                    </thead>
                    <tbody>
                    {_.map(filteredRegistry, (el, i) => {
                      return (
                        <Plugin
                          key={`plugin${i}`}
                          plugin={el}
                          version={
                            (el.isInstalled && _.find(plugins.installed, { name: el.name })) &&
                            _.find(plugins.installed, { name: el.name }).version
                          }
                          install={(el, index) => {
                            dispatch(pluginsActions.install(el, index))
                          }}
                          uninstall={(el, index) => {
                            dispatch(pluginsActions.uninstall(el, index))
                          }}
                          update={(el, index) => {
                            dispatch(pluginsActions.update(el, index))
                          }}

                        />
                      )
                    }
                    )}

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  plugins: state.plugins
})


export default connect(mapStateToProps)(Plugins)
