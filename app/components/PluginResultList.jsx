import React from 'react'
import {PluginResult} from './PluginResult'

export const PluginResultList = React.createClass({

  render() {
    return (
      <div>
      {this.props.plugins.results.map((plugin, i) => {
        return <PluginResult
          key={`PluginResult_${i}`}
          plugin={plugin}
          onClickDownload= {this.props.onClickDownload ? (e) => { this.props.onClickDownload(plugin, i) } : null}
          onClickUninstall= {this.props.onClickUninstall ? (e) => { this.props.onClickUninstall(plugin, i) } : null}
          />
      })}
      </div>
    );
  }
})
