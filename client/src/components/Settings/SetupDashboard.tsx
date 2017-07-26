import * as React from 'react';
import * as _ from 'lodash';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';

import ConnectionsSettings from './ConnectionsSettings';
import ConfigurationsStore, { IConfigurationsStoreState } from '../../stores/ConfigurationsStore';
import ConfigurationsActions from '../../actions/ConfigurationsActions';

import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';
import connections from '../../data-sources/connections';

import ConnectionsStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';
import SettingsStore from '../../stores/SettingsStore';
import SettingsActions from '../../actions/SettingsActions';

interface ISetupDashboardProps {
  dashboard: IDashboardConfig;
  connections: IConnections;
}

interface ISetupDashboardState {
  connections: IDict<IDict<string>>;
}

export default class SetupDashboard extends React.Component<ISetupDashboardProps, ISetupDashboardState> {

  constructor(props: ISetupDashboardProps) {
    super(props);

    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSaveGoToDashboard = this.onSaveGoToDashboard.bind(this);
    this.redirectToHomepageIfStandalone = this.redirectToHomepageIfStandalone.bind(this);

    this.state = {
      connections: this.props.connections
    };
  }

  componentDidUpdate(prevProps: ISetupDashboardProps, prevState: ISetupDashboardState) {
    if (!this.state.connections) {
      this.setState({ connections: this.props.connections });
    }
  }

  onParamChange(connectionKey: string, paramKey: string, value: any) {
    let { connections } = this.state;

    connections[connectionKey] = connections[connectionKey] || {};
    connections[connectionKey][paramKey] = value;
  }

  onSave() {
    let { dashboard } = this.props;
    let { connections } = this.state;

    dashboard.config.connections = connections;

    ConfigurationsActions.saveConfiguration(dashboard);
  }

  onSaveGoToDashboard() {
    this.onSave();
    setTimeout(this.redirectToHomepageIfStandalone, 2000);
  }

  onCancel() {
    this.redirectToHomepageIfStandalone();    
  }

  redirectToHomepageIfStandalone() {
    let { dashboard } = this.props;
    window.location.replace(`/dashboard/${dashboard.url}`);
  }

  render() {
    let { dashboard } = this.props;
    let { connections } = this.state;

    return (
      <div style={{ width: '100%' }}>
        <ConnectionsSettings connections={connections} />
        
        <div>
          <Button flat primary label="Save" onClick={this.onSave}>save</Button>
          <Button flat secondary label="Save and Go to Dashboard" onClick={this.onSaveGoToDashboard}>save</Button>
          <Button flat secondary label="Cancel" onClick={this.onCancel}>cancel</Button>
        </div>
        
      </div>
    );
  }
}
