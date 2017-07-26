import * as React from 'react';
import * as _ from 'lodash';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';

import ConfigurationsActions from '../../../actions/ConfigurationsActions';
import ConfigurationsStore from '../../../stores/ConfigurationsStore';

import { DataSourceConnector, IDataSourceDictionary } from '../../../data-sources';
import connectionsDefinitions from '../../../data-sources/connections';

import ConnectionsStore from '../../../stores/ConnectionsStore';
import ConnectionsActions from '../../../actions/ConnectionsActions';
import SettingsStore from '../../../stores/SettingsStore';
import SettingsActions from '../../../actions/SettingsActions';

interface IConfigDashboardProps {
  connections: IDictionary;
}

interface IConfigDashboardState {
  connections: IDictionary;
}

export default class ConnectionsSettings extends React.Component<IConfigDashboardProps, IConfigDashboardState> {

  state: IConfigDashboardState = {
    connections: {}
  };
  
  constructor(props: IConfigDashboardProps) {
    super(props);

    this.state.connections = this.props.connections;
  }

  onParamChange(connectionKey: string, paramKey: string, value: any) {
    let { connections } = this.state;
    connections[connectionKey] = connections[connectionKey] || {};
    connections[connectionKey][paramKey] = value;
  }

  render() {
    let { connections } = this.state;

    return (
      <div style={{ width: '100%' }}>
        {_.keys(connections).map(connectionKey => {
          
          if (connectionsDefinitions[connectionKey].editor) {
            let EditorClass = connectionsDefinitions[connectionKey].editor;
            return (
              <div key={connectionKey}>
                <EditorClass 
                  connection={connections[connectionKey]} 
                  onParamChange={this.onParamChange.bind(this, connectionKey)} 
                />
              </div>
            );
          } else {
            return (
              <div key={connectionKey}>
                <h2>{connectionKey}</h2>
                {
                  _.keys(connections[connectionKey]).map(paramKey => (
                    <div key={paramKey}>
                      <TextField
                        id="paramKey"
                        label={paramKey}
                        defaultValue={connections[connectionKey] && connections[connectionKey][paramKey] || ''}
                        lineDirection="center"
                        placeholder="Fill in required connection parameter"
                        className="md-cell md-cell--bottom"
                        onChange={this.onParamChange.bind(this, connectionKey, paramKey)}
                      />
                    </div>
                  ))
                }
              </div>
            );
          }
        })}
      </div>
    );
  }
}
