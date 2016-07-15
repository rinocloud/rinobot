import React, { PropTypes } from 'react'
import { PluginResult } from './PluginResult'

class PluginResultList extends React.Component {

  static propTypes = {
    pluginsList: PropTypes.array.isRequired,
    onClickDownload: PropTypes.func,
    onClickUninstall: PropTypes.func,
  }

  render() {
    const { pluginsList, onClickDownload, onClickUninstall } = this.props

    return (
      <div>
        {pluginsList.map((plugin, i) =>
          <PluginResult
            key={`PluginResult_${i}`}
            plugin={plugin}
            onClickDownload={onClickDownload ? () => {
              onClickDownload(plugin, i)
            } : null}
            onClickUninstall={onClickUninstall ? () => {
              onClickUninstall(plugin, i)
            } : null}
          />
        )}
      </div>
    )
  }
}

export { PluginResultList }
