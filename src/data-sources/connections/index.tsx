import * as React from 'react';

import ApplicationInsightsConnection from './application-insights';
import { IConnection } from './Connection';

var connectionTypes = [ ApplicationInsightsConnection ];

var connections: IDict<IConnection> = {};
connectionTypes.forEach(connectionType => {
  var newConnection: IConnection = new connectionType();
  connections[newConnection.type] = newConnection;
});

export default connections;