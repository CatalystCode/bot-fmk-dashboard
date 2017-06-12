import { IDataSourceDictionary } from '../../data-sources';
import { setupTests } from '../utils/setup';
import { appInsightsUri } from '../../data-sources/plugins/ApplicationInsights/common';

import { mockRequests } from '../mocks/requests/application-insights';
import dashboardMock from '../mocks/dashboards/application-insights';

describe('Data Source: Application Insights: Query', () => {

  let dataSources: IDataSourceDictionary = {};

  beforeAll(() => {

    mockRequests();
    dataSources = setupTests(dashboardMock);
  });

  it ('Query for 30 months with data rows', () => {
    
    expect(dataSources).toHaveProperty('events');
    expect(dataSources.timespan).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('action');
    expect(dataSources.events.store).toHaveProperty('state');

    // Listening to store to catch values arrival from app insights
    return new Promise((resolve, reject) => {
      var stateUpdate = (state => {
        try {
          expect(state).toHaveProperty('values');
          expect(state.values).toHaveLength(15);
          expect(state.values[0]).toHaveProperty('name', 'name: message.received');
          expect(state.values[0]).toHaveProperty('rowname', 'RowName: name: message.received');
          expect(state.values[0]).toHaveProperty('rowindex', 'RowIndex: 0');
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

  it ('Query for 24 hours with 0 rows', () => {
    dataSources.timespan.action.updateSelectedValue.defer('24 hours');

    return new Promise((resolve, reject) => {
      var stateUpdate = (state => {
        try {
          expect(state).toHaveProperty('values');
          expect(state.values).toHaveLength(0);
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
