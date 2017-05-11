import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';
import { appInsightsUri } from '../../data-sources/plugins/ApplicationInsights/common';

import { mockRequests } from '../mocks/application-insights/requests';
import dataSourcesMock from '../mocks/application-insights/dataSources';

describe('Data Source: Application Insights: Query', () => {

  let dataSources: IDataSourceDictionary = {};

  beforeAll(() => {

    mockRequests();
    DataSourceConnector.createDataSources({ dataSources: dataSourcesMock }, {});
    dataSources.timespan.action.updateDependencies();
  });

  it ('Query for 30 months with data rows', function (done) {
    
    expect(dataSources).toHaveProperty('events');
    expect(dataSources.timespan).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('store');
    expect(dataSources.events).toHaveProperty('action');
    expect(dataSources.events.store).toHaveProperty('state');

    // Listening to store to catch values arrival from app insights
    var stateUpdate = (state => {
      try {
        expect(state).toHaveProperty('timespan');
        expect(state).toHaveProperty('queryTimespan');
        expect(state).toHaveProperty('values');

        expect(state.timespan).toBe('1 month');
        expect(state.queryTimespan).toBe('P30D');

        expect(state.values).toHaveProperty('length');
        expect(state.values.length).toBe(15);
        done();
      } catch (e) {
        done(e);
      }
      finally {
        dataSources.events.store.unlisten(stateUpdate);
      }
    });
    dataSources.events.store.listen(stateUpdate);
  });

  it ('Query for 24 hours with 0 rows', function (done) {
    dataSources.timespan.action.updateSelectedValue.defer('24 hours');

    // Listening to store to catch values arrival from app insights
    var stateUpdate = (state => {
      try {
        expect(state).toHaveProperty('timespan');
        expect(state).toHaveProperty('queryTimespan');
        expect(state).toHaveProperty('values');

        expect(state.timespan).toBe('24 hours');
        expect(state.queryTimespan).toBe('PT24H');

        expect(state.values).toHaveProperty('length');
        expect(state.values.length).toBe(0);
        done();
      } catch (e) {
        done(e);
      }
      finally {
        dataSources.events.store.unlisten(stateUpdate);
      }
    });
    dataSources.events.store.listen(stateUpdate);

  });

});
