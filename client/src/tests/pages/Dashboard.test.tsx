import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { Card } from 'react-md/lib/Cards';

import Dashboard from '../../components/Dashboard';

import DashboardPage  from '../../pages/Dashboard';

import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

import dashboardMock from '../mocks/dashboards/dashboard';
import ElementConnector from '../../components/ElementConnector';

describe('HomePage', () => {

  let dataSources: IDataSourceDictionary = {};
  let dashboard;

  it('Check Dashboard Page is loading', () => {
        var a = TestUtils.renderIntoDocument(<DashboardPage dashboard={dashboardMock} />);

    // This test is just to make sure the component is able to render
  });

  it('Check Dashboard is loading', () => {
        var a = TestUtils.renderIntoDocument(<Dashboard dashboard={dashboardMock} />);

    // This test is just to make sure the component is able to render
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(dashboard);
  })
});