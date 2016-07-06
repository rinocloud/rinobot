import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { PluginResultList } from './PluginResultList'
import * as pluginsActions from '../actions/plugins'

export class InstalledPlugins extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleUninstallClick = this.handleUninstallClick.bind(this)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(pluginsActions.readLocalPlugins())
  }

  handleUninstallClick(plugin, i) {
    const { dispatch } = this.props
    dispatch(pluginsActions.uninstallPackage(plugin, i))
  }

  render() {
    const { plugins } = this.props

    return (
      <div className="container">
        <div className="row m-t">
          <div className="col-sm-12">
            <PluginResultList
              pluginsList={plugins.installedPackages}
              onClickUninstall={this.handleUninstallClick}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  plugins: state.plugins
}))(InstalledPlugins);
