import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

function setupTests(dashboardMock: IDashboardConfig, done?: () => void): IDataSourceDictionary {
  DataSourceConnector.createDataSources(dashboardMock, dashboardMock.config.connections);
  let dataSources = DataSourceConnector.getDataSources();

  // Waiting for all defered functions to complete their execution
  done && setTimeout(done, 100);

  return dataSources;
}

export {
  setupTests
};