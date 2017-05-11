import * as nock from 'nock';
import query24HResponseMock from './query.24h.mock';
import query30DResponseMock from './query.30d.mock';
import { appInsightsUri, appId, apiKey } from '../../../data-sources/plugins/ApplicationInsights/common';

/**
 * Mocking application insights requets
 */
function mockRequests() {

  nock(appInsightsUri, {
    reqheaders: {
      "x-api-key": apiKey
    }
  })
    .get(`/${appId}/query?timespan=PT24H&query=customEvents`)
    .reply(200, query24HResponseMock)
    .get(`/${appId}/query?timespan=P30D&query=customEvents`)
    .reply(200, query30DResponseMock);

}
export {
  mockRequests
};