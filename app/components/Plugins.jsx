import React from 'react'
import { connect } from 'react-redux'
import {PluginResultList} from './PluginResultList'
import * as pluginsActions from '../actions/plugins'

export const Plugins = React.createClass({

  componentDidMount(){
    const {dispatch, plugins} = this.props
    dispatch(pluginsActions.doSearch(''))
  },

  handleSearchClick(e){
    const {dispatch, plugins} = this.props
    e.preventDefault()
    dispatch(pluginsActions.doSearch(this._input.value))
  },

  onClickDownload(plugin, i){
    const {dispatch, plugins} = this.props
    dispatch(pluginsActions.downloadPackage(plugin, i))
  },

  render() {
    const {dispatch, plugins} = this.props

    return (
      <div className="container">
        <div className="row m-t">
          <input type="text" className="form-control" ref={(c)=>{this._input =c}} placeholder="Search for rinobot plugins"/>
          <a href="#" className="m-t btn btn-primary" onClick={this.handleSearchClick}>
            {plugins.isSearching ?
              <span>Searching <i className="fa fa-spinner fa-spin"></i></span>
              :
              'Search'
            }
          </a>
            {plugins.statusText}
        </div>

        <div className="row m-t">
          <PluginResultList plugins={plugins} onClickDownload={this.onClickDownload}/>
        </div>
      </div>
    );
  }
})

export default connect((state)=>({
  plugins: state.plugins
}))(Plugins);
