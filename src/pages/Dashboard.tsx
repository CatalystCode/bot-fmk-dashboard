import * as React from 'react';

import DashboardComponent from '../components/Dashboard';
import ConfigDashboard from '../components/ConfigDashboard';

import ConfigurationsActions from '../actions/ConfigurationsActions';
import ConfigurationsStore from '../stores/ConfigurationsStore';
import { IDashboardConfig, IConnections } from '../types';

interface IDashboardState {
  dashboard?: IDashboardConfig;
  connections?: IConnections;
  connectionsMissing?: boolean;
}

export default class Dashboard extends React.Component<any, IDashboardState> {

  state: IDashboardState = {
    dashboard: null,
    connections: {},
    connectionsMissing: false
  };

  constructor(props: any) {
    super(props);

   // ConfigurationsActions.loadConfiguration();
  }

  componentDidMount() {

    this.setState(ConfigurationsStore.getState());

    ConfigurationsStore.listen(state => {
      this.setState(ConfigurationsStore.getState());
    });
  }

  render() {

    var { dashboard, connections, connectionsMissing } = this.state;

    if (!dashboard) {
      return null;
    }

    if (connectionsMissing) {
      return (
        <ConfigDashboard dashboard={dashboard} connections={connections} />
      );
    }

    return (
      <DashboardComponent dashboard={dashboard} />
    );
  }
}
