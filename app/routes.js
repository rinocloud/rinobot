import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import Watcher from './components/Watcher';
import Documentation from './components/Documentation';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Watcher} />
    <Route path="/documentation" component={Documentation}/>
  </Route>
);
