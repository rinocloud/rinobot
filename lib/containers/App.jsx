import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Notifications } from '../components/Notifications'
import * as uiActions from '../actions/ui'


class App extends React.Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
  }

  render() {
    const { actions, ui, children } = this.props
    return (
      <div>
        <Notifications
          notification={ui.notification}
          installUpdate={actions.installUpdate}
          updateNotes={ui.updateNotes}
          updateShowing={ui.updateShowing}
          updateVersion={ui.updateVersion}
        />

        {children}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...uiActions
  }, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
