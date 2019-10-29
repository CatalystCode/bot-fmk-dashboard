import { IDataSourceDictionary } from '../../data-sources';
import { setupTests } from '../utils/setup';
import { DIRECT_LINE_URL } from '../../data-sources/plugins/BotFramework/DirectLine';

import { mockRequests } from '../mocks/requests/directline';
import dashboardMock from '../mocks/dashboards/bot-framework-directline';

describe('Data Source: DirectLine: Query', () => {

  let dataSources: IDataSourceDictionary = {};

  beforeAll(done => {
    mockRequests();
    setupTests(dashboardMock, ds => dataSources = ds, done);
  });

  it ('Query for data', () => {
    expect(dataSources).toHaveProperty('events');
    expect(dataSources.timespan).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('action');
    expect(dataSources.events.store).toHaveProperty('state');

    return new Promise((resolve, reject) => {
      var stateUpdate = (state => {
        try {
          expect(state).toMatchSnapshot('directLineStubResponse')
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
