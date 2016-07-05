import React, { PropTypes } from 'react'
import { PluginResult } from './PluginResult'

export class PluginResultList extends React.Component {

  static propTypes = {
    pluginsList: PropTypes.array.isRequired,
    onClickDownload: PropTypes.func,
    onClickUninstall: PropTypes.func,
  }

  render() {
    return (
      <div>
        {this.props.pluginsList.map((plugin, i) =>
          <PluginResult
            key={`PluginResult_${i}`}
            plugin={plugin}
            onClickDownload={this.props.onClickDownload ? () => {
              this.props.onClickDownload(plugin, i)
            } : null}
            onClickUninstall={this.props.onClickUninstall ? () => {
              this.props.onClickUninstall(plugin, i)
            } : null}
          />
        )}
      </div>
    )
  }
}
