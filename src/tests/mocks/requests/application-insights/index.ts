import * as nock from 'nock';
import dashboardMock from '../../dashboards/application-insights';
import query24HResponseMock from './query.24h.mock';
import query30DResponseMock from './query.30d.mock';
import { appInsightsUri } from '../../../../data-sources/plugins/ApplicationInsights/common';

const { appId, apiKey } = dashboardMock.config.connections['application-insights'];

function mock24hoursAppInsightsRequest() {
  nock(appInsightsUri)
  .post(`/query`)
  .delay(100)
  .reply(200, query24HResponseMock)
}

function mock30daysAppInsightsRequest() {
  nock(appInsightsUri)
  .post(`/query`)
  .delay(100)
  .reply(200, query30DResponseMock);
}

export {
  mock24hoursAppInsightsRequest,
  mock30daysAppInsightsRequest,
};