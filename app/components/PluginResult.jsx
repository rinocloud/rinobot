import React from 'react'
const {shell} = require('electron');

export const PluginResult = React.createClass({
  openPluginHomepage(e){
    e.preventDefault()
    shell.openExternal(this.props.plugin.html_url + '#readme')
  },

  render() {

    const {plugin} = this.props

    const onClickDownload = (e)=>{
      e.preventDefault()
      this.props.onClickDownload()
    }

    const onClickUninstall = (e)=>{
      e.preventDefault()
      this.props.onClickUninstall()
    }

    let cls = "m-l btn btn-xs"
    if (plugin.isInstalled) cls += " btn-success"
    else cls+=" btn-primary"

    return (
      <div>
          <div className="row">
            <a href="#" onClick={this.openPluginHomepage}>{plugin.name}</a>{'   '}

            {this.props.onClickDownload ?
              <a href="#" className={cls} onClick={onClickDownload}>{
                plugin.isInstalling ?
                <span>Installing <i className="fa fa-spin fa-spinner"></i></span>
                :
                plugin.isInstalled ? 'Update' : 'Install'
              }</a>
              :
              ''
             }

           {this.props.onClickUninstall ?
             <a href="#" className="m-l btn btn-xs btn-danger" onClick={onClickUninstall}>Uninstall</a>
             :
             null
            }

          </div>
          <div className="row">
            {plugin.description}
          </div>
          <hr/>
        </div>
    );
  }
})
