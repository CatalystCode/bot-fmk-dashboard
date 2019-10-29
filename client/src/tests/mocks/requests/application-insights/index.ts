import * as nock from 'nock';
import dashboardMock from '../../dashboards/application-insights';
import query24HResponseMock from './query.24h.mock';
import query30DResponseMock from './query.30d.mock';
import { appInsightsUri } from '../../../../data-sources/plugins/ApplicationInsights/common';
import { REPLACE } from 'history/lib/actions';

const { appId, apiKey } = dashboardMock.config.connections['application-insights'];

/**
 * Mocking application insights requets
 */
function mockRequests() {

  nock('http://localhost')
    .post('/applicationInsights/query', {
      query: /(.*?)/g,
      appId: appId,
      dashboardId: dashboardMock.id,
      queryTimespan: 'PT24H'
    })
    .delay(10)
    .reply(200, query24HResponseMock)
    .post('/applicationInsights/query', {
      query: /(.*?)/g,
      appId: appId,
      dashboardId: dashboardMock.id,
      queryTimespan: 'P30D'
    })
    .delay(10)
    .reply(200, query30DResponseMock)
    .post('/applicationInsights/query', {
      query: /(.*?)/g,
      appId: 'id_fail',
      dashboardId: dashboardMock.id,
      queryTimespan: 'P30D'
    })
    .delay(10)
    .reply(404, 'Some error');
}

export {
  mockRequests
};