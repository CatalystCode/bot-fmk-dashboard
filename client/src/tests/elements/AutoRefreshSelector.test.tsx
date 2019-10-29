import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { Card } from 'react-md/lib/Cards';

import { AutoRefreshSelector, RefreshActions, RefreshStore }  from '../../components/AutoRefreshSelector';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

import dashboardMock from '../mocks/dashboards/pie';
import ElementConnector from '../../components/ElementConnector';

describe('AutoRefreshSelector', () => {

  let dataSources: IDataSourceDictionary = {};
  let refresher;

  beforeAll((done) => {
    DataSourceConnector.createDataSources(dashboardMock, dashboardMock.config.connections);
    dataSources = DataSourceConnector.getDataSources();

    setTimeout(() => {

      try {
        let {id, dependencies, source, actions, props, title, subtitle } = dashboardMock.elements[0];
        let atts = {id, dependencies, source, actions, props, title, subtitle };
        let autoRefresherElement = ElementConnector.createGenericElement(
          AutoRefreshSelector, 
          'autorefresher', 
          0, 
          source, 
          dependencies, 
          actions, 
          props, 
          title, 
          subtitle);
        refresher = TestUtils.renderIntoDocument(autoRefresherElement);
        TestUtils.isElementOfType(refresher, 'div');

        // Adding a timeout to make sure Flux cycle is complete
        setTimeout(done, 100);
        
      } catch (e) {
        return done(e);
      }

    }, 100);
  })

  it('Update interval to "None"', () => {
    RefreshStore.listen((state) => {
      expect(state.refreshInterval).toBe(-1);
    });
    RefreshActions.setRefreshTimer(
      -1,
      // empty call back. we don't care which logic is scheduled...
      () => {
      });
  });

  it('Update interval to a positive value', () => {
    RefreshStore.listen((state) => {
      expect(state.refreshInterval).toBe(10000);
    });
    RefreshActions.setRefreshTimer(
      10000,
      // empty call back. we don't care which logic is scheduled...
      () => {
      });
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(refresher);
  })
});