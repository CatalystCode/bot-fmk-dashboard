import alt, { AbstractStoreModel } from '../alt';
import * as _ from 'lodash';

import connections from '../data-sources/connections';
import { DataSourceConnector, IDataSourceDictionary } from '../data-sources';
import configurationActions from '../actions/ConfigurationsActions';
import { IDashboardConfig, IDictionary } from '../types';

interface IConfigurationsStoreState {
  dashboard: IDashboardConfig;
  dashboards: IDashboardConfig[];
  template: IDashboardConfig;
  templates: IDashboardConfig[];
  creationState: string;
  connections: IDictionary;
  connectionsMissing: boolean;
  loaded: boolean;
}

class ConfigurationsStore extends AbstractStoreModel<IConfigurationsStoreState> implements IConfigurationsStoreState {

  dashboard: IDashboardConfig;
  dashboards: IDashboardConfig[];
  template: IDashboardConfig;
  templates: IDashboardConfig[];
  creationState: string;
  connections: IDictionary;
  connectionsMissing: boolean;
  loaded: boolean;

  constructor() {
    super();

    this.dashboard = null;
    this.dashboards = null;
    this.template = null;
    this.templates = null;
    this.creationState = null;
    this.connections = {};    
    this.connectionsMissing = false;
    this.loaded = false;

    this.bindListeners({
      loadConfiguration: configurationActions.loadConfiguration,
      loadDashboard: configurationActions.loadDashboard,
      loadTemplate: configurationActions.loadTemplate,
      createDashboard: configurationActions.createDashboard
    });

    configurationActions.loadConfiguration();

    let pathname = window.location.pathname;
    if (pathname === '/dashboard') {
      configurationActions.loadDashboard("0");
    }
    
    if (pathname.startsWith('/dashboard/')) {
      let dashboardId = pathname.substring('/dashboard/'.length);
      configurationActions.loadDashboard(dashboardId);
    }
  }
  
  loadConfiguration(result: { dashboards: IDashboardConfig[], templates: IDashboardConfig[] }) {
    let { dashboards,templates } = result;
    this.dashboards = dashboards;
    this.templates = templates;
  }

  loadDashboard(result: { dashboard: IDashboardConfig }) {
    let { dashboard } = result;
    this.dashboard = dashboard;

    if (this.dashboard && !this.loaded) {
      DataSourceConnector.createDataSources(dashboard, dashboard.config.connections);
      
      this.connections = this.getConnections(dashboard);

      // Checking for missing connection params
      this.connectionsMissing = Object.keys(this.connections).some(connectionKey => {
        var connection = this.connections[connectionKey];
        
        return Object.keys(connection).some(paramKey => !connection[paramKey]);
      });
    }
  }

  createDashboard(result: { dashboard: IDashboardConfig }) {
    this.creationState = 'successful';
  }

  loadTemplate(result: { template: IDashboardConfig }) {
    let { template } = result;
    this.template = template;

    if (this.template) {
      
      this.connections = this.getConnections(template);

      // Checking for missing connection params
      this.connectionsMissing = Object.keys(this.connections).some(connectionKey => {
        var connection = this.connections[connectionKey];
        return Object.keys(connection).some(paramKey => !connection[paramKey]);
      })
    }
  }

  private getConnections(dashboard: IDashboardConfig): any {
    let requiredParameters = {};
    let dataSources = DataSourceConnector.getDataSources();
    _.values(dataSources).forEach(dataSource => {

      // If no connection requirements were set, return
      let connectionTypeName = dataSource.plugin.connectionType;
      if (!connectionTypeName) {
        return;
      }

      if (!connections[connectionTypeName]) {
        throw new Error(`No connection names ${connectionTypeName} was defined`);
      }

      var connectionType = connections[connectionTypeName];
      requiredParameters[connectionTypeName] = {};
      requiredParameters[connectionTypeName]['editor'] = connectionType.editor;
      connectionType.params.forEach(param => { requiredParameters[connectionTypeName][param] = null });

      // Connection type is already defined - check params
      if (dashboard.config.connections[connectionTypeName]) {
        var connectionParams = dashboard.config.connections[connectionTypeName];

        // Checking that all param definitions are defined
        connectionType.params.forEach(param => {
          requiredParameters[connectionTypeName][param] = connectionParams[param];
        });
      }
    });

    return requiredParameters;
  }
}

const configurationsStore = alt.createStore<IConfigurationsStoreState>(ConfigurationsStore, 'ConfigurationsStore');

export default configurationsStore;
