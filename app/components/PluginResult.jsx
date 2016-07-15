import React, { PropTypes } from 'react'
const { shell } = require('electron')

class PluginResult extends React.Component {

  static propTypes = {
    plugin: PropTypes.object.isRequired,
    onClickDownload: PropTypes.func,
    onClickUninstall: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.openPluginHomepage = this.openPluginHomepage.bind(this)
  }

  openPluginHomepage(e) {
    const { plugin } = this.props
    e.preventDefault()

    if (!plugin.isLocal) {
      shell.openExternal(`${plugin.html_url}#readme`)
    } else {
      shell.showItemInFolder(plugin.path)
    }
  }

  render() {
    const { plugin } = this.props

    const onClickDownload = (e) => {
      e.preventDefault()
      this.props.onClickDownload()
    }

    const onClickUninstall = (e) => {
      e.preventDefault()
      this.props.onClickUninstall()
    }

    let cls = 'm-l btn btn-xs'
    if (plugin.isInstalled) cls += ' btn-success'
    else cls += ' btn-primary'

    return (
      <div className="p-a bordered m-t">
        <div className="row">
          <div className="col-sm-12 lead m-b-0">
            <p><a href="#" onClick={this.openPluginHomepage}>{plugin.name}</a>{'   '}

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
              <a
                href="#"
                className="m-l btn btn-xs btn-danger"
                onClick={onClickUninstall}
              >
                  Uninstall
              </a>
             :
             null
            }
            </p>
            <p>{plugin.description}</p>
          </div>
        </div>
      </div>
    );
  }
}

export { PluginResult }
