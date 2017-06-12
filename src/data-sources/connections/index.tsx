import * as React from 'react';

import ApplicationInsightsConnection from './application-insights';
import GraphQLConnection from './graphql';
import BotFrameworkConnection from './bot-framework';
import CosmosDBConnection from './cosmos-db';
import AzureConnection from './azure';
import { IConnection } from './Connection';

var connectionTypes = [ 
  ApplicationInsightsConnection, 
  GraphQLConnection,
  AzureConnection, 
  CosmosDBConnection, 
  BotFrameworkConnection ];

var connections: IDict<IConnection> = {};
connectionTypes.forEach(connectionType => {
  var newConnection: IConnection = new connectionType();
  connections[newConnection.type] = newConnection;
});

export default connections;