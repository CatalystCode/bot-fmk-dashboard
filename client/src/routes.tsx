import * as React from 'react';
import { Route } from 'react-router';

import App from './components/App';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';

export default (
  <Route component={App}>
    <Route path="/" component={Home} />
    <Route path="/home" component={Home} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/dashboard/:id" component={Dashboard}/>
    <Route path="/setup" component={Setup} />
    <Route path="*" component={NotFound} />
  </Route>
);