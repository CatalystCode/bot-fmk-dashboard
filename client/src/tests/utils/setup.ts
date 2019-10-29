import ConfigurationsActions from '../../actions/ConfigurationsActions';
import ConfigurationsStore from '../../stores/ConfigurationsStore';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

function setupTests(
  dashboardMock: IDashboardConfig, 
  setDataSources: (ds: IDataSourceDictionary) => void, 
  done: () => void): void {

  // Waiting for all defered functions to complete their execution
  ConfigurationsStore.listen(() => {
    let dataSources = DataSourceConnector.getDataSources();
    setDataSources(dataSources);
    return done();
  });

  ConfigurationsActions.loadDashboardComplete(dashboardMock);  
}

export {
  setupTests
};