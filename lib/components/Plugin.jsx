import React, { PropTypes } from 'react'
import { shell } from 'electron'
import ReactMarkdown from 'react-markdown'
import { Modal, Button } from 'react-bootstrap'
import moment from 'moment'

class Plugin extends React.Component {

  static propTypes = {
    install: PropTypes.func.isRequired,
    uninstall: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    plugin: PropTypes.object.isRequired,
    version: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ])
  }

  constructor(props) {
    super(props)
    this.state = { showModal: false }

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  openModal() {
    this.setState({ showModal: true })
  }


  closeModal() {
    this.setState({ showModal: false })
  }

  render() {
    const { plugin, version } = this.props

    return (
      <div className="row plugin">

        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="row">
                <div className="col-sm-11">
                  {plugin.name.replace('rinobot-plugin-', '')}{'  '}
                  documentation

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      shell.openExternal(plugin.homepage)
                    }}
                    className="pull-right"
                  >
                    View on Github
                  </a>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ReactMarkdown source={plugin.readme} />
          </Modal.Body>

          <Modal.Footer>
            <Button
              onClick={this.closeModal}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="col-sm-1">
          {!plugin.isInstalled &&
            <a
              href="#"
              className="btn btn-xs btn-primary"
              onClick={(e) => {
                e.preventDefault()
                this.props.install(plugin, plugin.index)
              }}
            >
              {plugin.isInstalling && 'Installing'}
              {!plugin.isInstalling && 'Install'}
            </a>
          }

          {plugin.isInstalled &&
            <a
              href="#"
              className="btn btn-xs btn-default"
              onClick={(e) => {
                e.preventDefault()
                this.props.uninstall(plugin, plugin.index)
              }}
            >
              Uninstall
            </a>
          }

          {plugin.canUpdate &&
            <a
              href="#"
              className="btn btn-xs btn-default"
              onClick={(e) => {
                e.preventDefault()
                this.props.update(plugin, plugin.index)
              }}
            >
              {plugin.isInstalling && 'Updating'}
              {!plugin.isInstalling && `Update to v${plugin.version}`}
            </a>
          }
        </div>

        <div className="col-sm-7">
          <div className="row">
            <div className="col-sm-12">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  this.openModal()
                }}
              >
                {plugin.name.replace('rinobot-plugin-', '')}
              </a>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              {plugin.description}
            </div>
          </div>


        </div>

        <div className="col-sm-2">
          <small className="text-muted">
            {plugin.isInstalled ?
              <span>
                v{version}
              </span>
              :
              <span>
                v{plugin.version} {' '} updated {moment(plugin.modified).fromNow()}
              </span>
            }
          </small>
        </div>

        <div className="col-sm-2 text-muted">{plugin.downloads}</div>
      </div>
    )
  }
}

export { Plugin }
