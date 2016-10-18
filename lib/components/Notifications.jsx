import React, { PropTypes } from 'react'
import { Notification } from './Notification'

class Notifications extends React.Component {

  static propTypes = {
    installUpdate: PropTypes.func.isRequired,
    updateNotes: PropTypes.string,
    updateShowing: PropTypes.bool,
    updateVersion: PropTypes.string,
  }

  render() {
    const {
      installUpdate,
      updateShowing,
      updateVersion,
      updateNotes
    } = this.props

    const onClickUpdate = (e) => {
      e.preventDefault()
      installUpdate()
    }

    return (
      <div className="notification-container">
      {
        updateShowing &&
          <Notification
            key="update"
            backgroundColor="#7ED321"
            text={`Version ${updateVersion} ready`}
            onDismiss={() => {}}
            userDismissable
          >
            Version <b>{updateVersion}</b> ready.
            {updateNotes && ` ${updateNotes.trim().replace(/\.$/, '')}`}
            {' '}
            (
            <a
              style={{ color: '#fff' }}
              onClick={ (ev) => { window.require('electron').shell.openExternal(ev.target.href); ev.preventDefault(); } } // eslint-disable-line
              href={`https://github.com/rinocloud/rinobot/releases/tag/${updateVersion}`}
            >
              notes
            </a>
            ).
            {' '}
            <a
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}
              onClick={onClickUpdate}
            >
                Restart
            </a>.
            {' '}
          </Notification>
      }
      </div>
    )
  }
}

export { Notifications }
