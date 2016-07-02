import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux'

export default React.createClass({
  render() {
    return  <div>
              {this.props.children}
            </div>
  }
})
