import alt, { AbstractActions } from '../alt';

interface IConnectionsActions {
  updateConnection(connectionName: string, args: IDictionary): any;
}

class ConnectionsActions extends AbstractActions implements IConnectionsActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  updateConnection(connectionName: string, args: IDictionary) {
    return { connectionName, args };
  }
}

const connectionsActions = alt.createActions<IConnectionsActions>(ConnectionsActions);

export default connectionsActions;
