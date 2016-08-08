import React, { PropTypes } from 'react'
import { Notification } from './Notification'
import * as updaterActions from '../actions/updater'

class Notifications extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    ui: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch } = this.props

    const onClickUpdate = (e) => {
      e.preventDefault()
      dispatch(updaterActions.installUpdate())
    }

    return (
      <div className="notification-container">
      {
        this.props.ui.updateShowing &&
          <Notification
            key="update"
            backgroundColor="#7ED321"
            text={`Version ${this.props.ui.updateVersion} ready`}
            onDismiss={() => {}}
            userDismissable
          >
            Version <b>{this.props.ui.updateVersion}</b> ready.
            {this.props.ui.updateNote && ` ${this.props.ui.updateNote.trim().replace(/\.$/, '')}`}
            {' '}
            (
            <a
              style={{ color: '#fff' }}
              onClick={ (ev) => { window.require('electron').shell.openExternal(ev.target.href); ev.preventDefault(); } } // eslint-disable-line
              href={`https://github.com/rinocloud/rinobot/releases/tag/${this.props.ui.updateVersion}`}
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
