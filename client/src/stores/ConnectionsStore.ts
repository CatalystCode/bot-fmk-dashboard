import alt, { AbstractStoreModel } from '../alt';

import connectionsActions from '../actions/ConnectionsActions';

interface IConnectionsStoreState {
  connections: IDictionary;
}

class ConnectionsStore extends AbstractStoreModel<IConnectionsStoreState> implements IConnectionsStoreState {

  connections: IDictionary;

  constructor() {
    super();

    this.connections = {};

    this.bindListeners({
      updateConnection: connectionsActions.updateConnection
    });
  }
  
  updateConnection(connectionName: string, args: IDictionary) {
    this.connections[connectionName] = args;
  }
}

const connectionsStore = alt.createStore<IConnectionsStoreState>(ConnectionsStore, 'ConnectionsStore');

export default connectionsStore;
