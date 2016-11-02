import React, { PropTypes } from 'react'
import _ from 'lodash'
import NotificationSystem from 'react-notification-system'

class Notifications extends React.Component {

  static propTypes = {
    notification: PropTypes.object.isRequired,
    installUpdate: PropTypes.func.isRequired,
    updateNotes: PropTypes.string,
    updateShowing: PropTypes.bool,
    updateVersion: PropTypes.string,
  }

  componentDidMount() {
    this.notificationSystem = this.refs.notificationSystem;

    if (this.props.notification.message) {
      this.notificationSystem.addNotification(this.props.notification)
    }
  }

  componentWillReceiveProps(newProps) {
    if (!_.isEqual(newProps.notification, this.props.notification)) {
      this.notificationSystem.addNotification(newProps.notification)
    }
  }

  render() {
    return (
      <div className="notification-container">
        <NotificationSystem ref="notificationSystem" noAnimation style={false} />
      </div>
    )
  }
}

export { Notifications }
