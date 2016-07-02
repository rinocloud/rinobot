import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import Login from './components/Login';
import Watcher from './components/Watcher';
import {requireAuthentication} from './components/AuthenticatedComponent';
import Documentation from './components/Documentation';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={requireAuthentication(Watcher)}/>
    <Route path="/documentation" component={requireAuthentication(Documentation)}/>
    <Route path="/login" component={Login}/>
  </Route>
);
