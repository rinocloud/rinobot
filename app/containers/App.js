import React, { Component, PropTypes } from 'react';

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render() {

    return <div>
        <div className="stage" id="stage">
          <div className="row m-a-0">
            <div className="main-container col-sm-12">
              <div className="row main">
                {this.props.children}
                {/*{
                  (() => {
                    if (process.env.NODE_ENV !== 'production') {
                      const DevTools = require('./DevTools'); // eslint-disable-line global-require
                      return <DevTools />;
                    }
                  })()
                }*/}
              </div>
            </div>
          </div>
        </div>
      </div>
  }
}
