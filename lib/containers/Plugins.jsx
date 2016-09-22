import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { shell } from 'electron'
import semver from 'semver'
import * as pluginsActions from '../actions/plugins'


class Plugins extends React.Component {

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

  setSearchTerm(val) {
    this.setState({ searchTerm: val === '' ? null : val })
  }

  clearSearchTerm() {
    this.setState({ searchTerm: null })
  }

  render() {
    const { dispatch, plugins } = this.props

    let registry = _.map(plugins.registry, (p, originalIndex) => {
      const isInstalled = _.map(plugins.installed, 'name').includes(p.name)
      let canUpdate = false
      if (isInstalled && p.version) {
        const currentPlugin = _.find(plugins.installed, { name: p.name })
        const registryVersion = p.version
        if (semver.validRange(currentPlugin.version)) {
          canUpdate = semver.gtr(registryVersion, currentPlugin.version)
        } else {
          canUpdate = semver.lt(currentPlugin.version, registryVersion)
        }
      }
      return {
        ...p,
        isInstalled,
        canUpdate,
        index: originalIndex
      }
    })

    registry.sort((x, y) => {
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

    const onClickUpdate = (plugin, index) => {
      dispatch(pluginsActions.update(plugin, index))
    }

    return (
      <div className="col-sm-12 p-a plugins">
        <h3>Plugins</h3>
        {plugins.isSearching ?
          <small className="text-muted pull-right">
            <i className="fa fa-spinner fa-spin"></i>
            {'  '}checking for updates
          </small>
        : ''}

        <div className="row m-b">
          <form className="col-sm-6">
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
        <div className="row">
          {plugins.statusText}
        </div>

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
          {_.map(registry, (el, i) => {
            return (
              <tr className="m-a-sm" key={`plugin${i}`}>
                <td style={{minWidth: '80px'}}>
                  {!el.isInstalled &&
                    <a
                      href="#"
                      className="btn btn-xs btn-primary"
                      onClick={(e) => {
                        e.preventDefault()
                        onClickInstall(el, el.index)
                      }}
                    >
                      {el.isInstalling && 'Installing'}
                      {!el.isInstalling && 'Install'}
                    </a>
                  }

                  {el.isInstalled &&
                    <a
                      href="#"
                      className="btn btn-xs btn-default"
                      onClick={(e) => {
                        e.preventDefault()
                        onClickUninstall(el, el.index)
                      }}
                    >
                      Uninstall
                    </a>
                  }

                  {el.canUpdate &&
                    <a
                      href="#"
                      className="btn btn-xs btn-default"
                      onClick={(e) => {
                        e.preventDefault()
                        onClickUpdate(el, el.index)
                      }}
                    >
                      {el.isInstalling && 'Updating'}
                      {!el.isInstalling && `Update to v${el.version}`}
                    </a>
                  }
                </td>

                <td>
                  <a
                    onClick={openExternal}
                    href={el.homepage}
                  >{el.name.replace('rinobot-plugin-', '')}</a>
                  <br />
                  <small className="text-muted">
                    {el.isInstalled ?
                      <span>
                        v{_.find(plugins.installed, { name: el.name }).version}
                      </span>
                      :
                      <span>
                        v{el.version}
                        {' '} updated by {el && el.author} {' '}
                        {moment(el.modified).fromNow()}
                      </span>
                    }
                  </small>
                </td>

                <td>{el.description}</td>

                <td className="text-muted">{el.downloads}</td>
              </tr>
            )
          }
          )}

          </tbody>
        </table>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  plugins: state.plugins
})


export default connect(mapStateToProps)(Plugins)
