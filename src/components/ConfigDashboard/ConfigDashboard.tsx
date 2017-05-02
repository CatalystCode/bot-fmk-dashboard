import * as React from 'react';
import * as _ from 'lodash';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';

import ConfigurationsActions from '../../actions/ConfigurationsActions';
import ConfigurationsStore from '../../stores/ConfigurationsStore';

import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';
import connections from '../../data-sources/connections';

import ConnectionsStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';

interface IConfigDashboardState {
  connections: IDictionary;
  error: string;
}

interface IConfigDashboardProps {
  dashboard: IDashboardConfig;
  connections: IDictionary;
}

export default class ConfigDashboard extends React.Component<IConfigDashboardProps, IConfigDashboardState> {

  state: IConfigDashboardState = {
    connections: {},
    error: null
  };

  constructor(props: any) {
    super(props);

    this.onSave = this.onSave.bind(this);
    this.onSaveGoToDashboard = this.onSaveGoToDashboard.bind(this);
  }

  onParamChange(connectionKey: string, paramKey: string, value: any) {
    let { connections } = this.state;
    connections[connectionKey] = connections[connectionKey] || {};
    connections[connectionKey][paramKey] = value;
    this.setState({ connections });
  }

  onSave() {
    let { dashboard } = this.props;
    let { connections } = this.state;

    if (!dashboard.config.connections) {
      dashboard.config.connections = connections;

    } else {
      _.keys(connections).forEach(connectionKey => {

        if (!dashboard.config.connections[connectionKey]) {
          dashboard.config.connections[connectionKey] = connections[connectionKey];
        } else {
          _.extend(dashboard.config.connections[connectionKey], connections[connectionKey]);
        }
      });
    }

    ConfigurationsActions.saveConfiguration(dashboard);
  }

  onSaveGoToDashboard() {
    this.onSave();
    
    setTimeout(
      () => {
        window.location.reload();
      }, 
      2000
    );
  }

  onCancel() {
    window.location.reload();    
  }

  render() {

    if (!this.props.dashboard) {
      return null;
    }

    let { connections } = this.props;
    let { error } = this.state;

    return (
      <div style={{ width: '100%' }}>
        {_.keys(connections).map(connectionKey => {
          
          if (connections[connectionKey].editor) {
            var EditorClass = connections[connectionKey].editor;
            return (
              <div key={connectionKey}>
                <EditorClass connection={connections[connectionKey]} onParamChange={this.onParamChange.bind(this)} />
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

        <br/>
        <Button flat primary label="Save" onClick={this.onSave}>save</Button>
        <Button flat secondary label="Save and Go to Dashboard" onClick={this.onSaveGoToDashboard}>save</Button>
        <Button flat secondary label="Cancel" onClick={this.onCancel}>cancel</Button>
      </div>
    );
  }
}
