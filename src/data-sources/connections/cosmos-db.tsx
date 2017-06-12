import * as React from 'react';
import { IConnection, ConnectionEditor, IConnectionProps } from './Connection';
import InfoDrawer from '../../components/common/InfoDrawer';
import TextField from 'react-md/lib/TextFields';
import Checkbox from 'react-md/lib/SelectionControls/Checkbox';

export default class CosmosDBConnection implements IConnection {
  type = 'cosmos-db';
  params = ['host', 'key'];
  editor = CosmosDBConnectionEditor;
}

class CosmosDBConnectionEditor extends ConnectionEditor<IConnectionProps, any> {

  render() {
    let { connection } = this.props;
    // connection = connection || {'ssl':true };
    return (
      <div>
        <h2 style={{ float: 'left', padding: 9 }}>CosmosDB</h2>
        <InfoDrawer
          width={300}
          title="CosmosDB"
          buttonIcon="help"
          buttonTooltip="Click here to learn more about CosmosDB"
        >
          <div>
            <a href="https://azure.microsoft.com/en-us/services/cosmos-db/" target="_blank">Create Cosmos DB</a>
            <hr/>
            <a href="https://www.documentdb.com/sql/demo" target="_blank">Try CosmosDB demo queries</a>
          </div>
        </InfoDrawer>
        <TextField
          id="host"
          label={'Host'}
          defaultValue={connection['host'] || ''}
          lineDirection="center"
          placeholder="Fill in hostname"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
        <TextField
          id="key"
          label={'Key'}
          defaultValue={connection['key'] || ''}
          lineDirection="center"
          placeholder="Fill in Key"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
      </div>
    );
  }

}
