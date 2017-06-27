import { IDataSourceDictionary } from '../../data-sources';
import { setupTests } from '../utils/setup';

import { mock24hoursAppInsightsRequest, mock30daysAppInsightsRequest } from '../mocks/requests/application-insights';
import dashboardMock from '../mocks/dashboards/application-insights';

describe('Data Source: Application Insights: Query', () => {

  let dataSources: IDataSourceDictionary = {};

  beforeAll(() => {
    dataSources = setupTests(dashboardMock);
  });

  it ('Query for 30 days with data rows', () => {
    mock30daysAppInsightsRequest();

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
    mock24hoursAppInsightsRequest();
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
