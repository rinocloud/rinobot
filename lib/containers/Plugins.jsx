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

    let registry = _.map(plugins.registry, p => {
      const isInstalled = _.has(plugins.installed.dependencies, p.name)
      let canUpdate = false
      if (isInstalled && p.version) {
        const currentVersion = plugins.installed.dependencies[p.name]
        const registryVersion = p.version

        if (semver.validRange(currentVersion)) {
          canUpdate = semver.gtr(registryVersion, currentVersion)
        } else {
          canUpdate = semver.lt(currentVersion, registryVersion)
        }
      }
      return {
        ...p,
        isInstalled,
        canUpdate
      }
    })

    registry.sort((x, y) => {
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

    const onClickUpdate = (plugin, index) => {
      dispatch(pluginsActions.update(plugin, index))
    }

    return (
      <div className="panel panel-default plugins">
        <div className="panel-heading">
          <h6 className="block-title">
          Plugins{'  '}
          </h6>
          {plugins.isSearching ?
            <small className="text-muted">
              <i className="fa fa-spinner fa-spin"></i>
              {'  '}checking for updates
            </small>
          : ''}
        </div>

        <div className="panel-body">
          <div className="col-sm-12">
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

            {_.map(registry, (el, i) => {
              return (
                <div className="row" key={`plugin${i}`}>
                  <div className="m-b">
                    <span
                      className="m-r lead"
                      style={{
                        fontWeight: 500,
                        verticalAlign: 'bottom'
                      }}
                    >
                      <a
                        onClick={openExternal}
                        href={el.homepage}
                      >{el.name.replace('rinobot-plugin-', '')}</a>
                    </span>
                    {!el.isInstalled ?
                      <a
                        href="#"
                        className="btn btn-xs btn-primary"
                        onClick={(e) => {
                          e.preventDefault()
                          onClickInstall(el, i)
                        }}
                      >
                        {
                          el.isInstalling
                          ?
                          'Installing'
                          :
                          'Install'
                        }
                      </a>

                      :
                      <span>
                        <a
                          href="#"
                          className="btn btn-xs btn-default"
                          onClick={(e) => {
                            e.preventDefault()
                            onClickUninstall(el, i)
                          }}
                        >
                          Uninstall
                        </a>{'  '}
                        {el.canUpdate ? // eslint-disable-line
                          <a
                            href="#"
                            className="btn btn-xs btn-default"
                            onClick={(e) => {
                              e.preventDefault()
                              onClickUpdate(el, i)
                            }}
                          >
                            Update to v{el.version}
                          </a>
                          :
                          <span className=" text-muted">
                            up to date
                          </span>
                        }
                      </span>
                      }
                  </div>

                  <div>{el.description}</div>

                  <small className="text-muted">
                    {el.isInstalled ?
                      <span>
                        Your version: v{plugins.installed.dependencies[el.name]}
                      </span>
                      :
                      <span>
                        v{el.version}
                        {' '} updated by {el && el.author} {' '}
                        {moment(el.modified).fromNow()}
                      </span>
                    }
                  </small>
                  <hr />
                </div>
              )
            }
            )}

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
