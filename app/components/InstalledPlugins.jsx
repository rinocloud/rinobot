import React from 'react'
import { connect } from 'react-redux'
import {PluginResultList} from './PluginResultList'
import * as pluginsActions from '../actions/plugins'

export const InstalledPlugins = React.createClass({

  componentDidMount(){
    const {dispatch, plugins} = this.props
    dispatch(pluginsActions.readLocalPlugins())
  },

  handleSearchClick(e){
    const {dispatch, plugins} = this.props
    e.preventDefault()
    dispatch(pluginsActions.doSearch(this._input.value))
  },

  onClickUninstall(plugin, i){
    const {dispatch, plugins} = this.props
    dispatch(pluginsActions.uninstallPackage(plugin, i))
  },

  render() {
    const {dispatch, plugins} = this.props

    return (
      <div className="container">
        <div className="row m-t">
          <PluginResultList
            plugins={plugins}
            onClickUninstall={this.onClickUninstall}
            />
        </div>
      </div>
    );
  }
})

export default connect((state)=>({
  plugins: state.plugins
}))(InstalledPlugins);
