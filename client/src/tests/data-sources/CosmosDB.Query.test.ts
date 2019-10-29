import { IDataSourceDictionary } from '../../data-sources';
import { setupTests } from '../utils/setup';
import { COSMOS_DB_QUERY_URL } from '../../data-sources/plugins/CosmosDB/Query';

import { mockRequests } from '../mocks/requests/cosmosdb';
import dashboardMock from '../mocks/dashboards/cosmosdb';

describe('Data Source: CosmosDB: Query', () => {

  let dataSources: IDataSourceDictionary = {};

  beforeAll(done => {
    mockRequests();
    setupTests(dashboardMock, ds => dataSources = ds, done);
  });

  it('Query for data', () => {

    expect(dataSources).toHaveProperty('events');
    expect(dataSources.timespan).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('action');
    expect(dataSources.events.store).toHaveProperty('state');

    return new Promise((resolve, reject) => {
      var stateUpdate = (state => {
        try {
          expect(state).toMatchSnapshot('cosmosDBStubResponse')
          return resolve();
        } catch (e) {
          return reject(e);
        } finally {
          dataSources.events.store.unlisten(stateUpdate);
        }
      });
      dataSources.events.store.listen(stateUpdate);
    });
  });
});
