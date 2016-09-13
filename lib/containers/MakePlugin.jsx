import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

class MakePlugin extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    plugins: PropTypes.object.isRequired,
  }

  render() {
    const { dispatch, plugins } = this.props
    return (
      <div className="panel panel-default plugins">
        <div className="panel-heading">
          Make a plugin
        </div>

        <div className="panel-body">
          <div className="col-sm-12">
            <div className="row m-b">
              1. If your a programmer, or have some code you would like to adapt for Rinobot,
              have a look at the guide on{'  '}
              <a
                href="http://docs.rinocloud.com/rinobot/plugins/creating_a_plugin.html"
              >
                making a plugin
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  plugins: state.plugins
})

export default connect(mapStateToProps)(MakePlugin)
