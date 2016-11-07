import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { SettingsForm } from '../components/SettingsForm'
import * as settingsActions from '../actions/settings'

class Settings extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(settingsActions.hydrate())
  }

  render() {
    const { dispatch, settings } = this.props

    return (
      <div>
        <div className="main config">
          <div className="row">
            <div className="col-sm-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  Settings
                </div>
                <div className="panel-body">
                  <SettingsForm
                    onSubmit={(values) => {
                      dispatch(settingsActions.setSettings(values))
                    }}
                    initialValues={settings}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  settings: state.settings
})

export default connect(mapStateToProps)(Settings)
