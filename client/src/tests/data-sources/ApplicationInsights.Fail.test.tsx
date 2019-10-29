import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { IDataSourceDictionary } from '../../data-sources';
import { setupTests } from '../utils/setup';
import { appInsightsUri } from '../../data-sources/plugins/ApplicationInsights/common';

import { Toast } from '../../components/Toast';
import { mockRequests } from '../mocks/requests/application-insights';
import dashboardMock from '../mocks/dashboards/application-insights-fail';

describe('Data Source: Application Insights: Query', () => {

  let dataSources: IDataSourceDictionary = {};
  let element;
  
  beforeAll(done => {

    mockRequests();
    element = TestUtils.renderIntoDocument(<Toast />);
    TestUtils.isElementOfType(element, 'div');
    setupTests(dashboardMock, ds => dataSources = ds, () => setTimeout(done, 100));
  });

  it ('Query for 30 months with data rows', () => {
    
    let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
    expect(component[0].state.toasts.length).toBe(1);
    
  });
});
