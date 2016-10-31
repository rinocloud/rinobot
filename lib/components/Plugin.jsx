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
      <tr className="m-a-sm">

        <Modal
          show={this.state.showModal}
          onHide={this.closeModal}
        >
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

        <td style={{ minWidth: '80px' }}>
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
        </td>

        <td>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              this.openModal()
            }}
          >
            {plugin.name.replace('rinobot-plugin-', '')}
          </a>
          <br />
          <small className="text-muted">
            {plugin.isInstalled ?
              <span>
                v{version}
              </span>
              :
              <span>
                v{plugin.version}
                {' '} updated by {plugin && plugin.author} {' '}
                {moment(plugin.modified).fromNow()}
              </span>
            }
          </small>
        </td>

        <td>{plugin.description}</td>

        <td className="text-muted">{plugin.downloads}</td>
      </tr>
    )
  }
}

export { Plugin }
