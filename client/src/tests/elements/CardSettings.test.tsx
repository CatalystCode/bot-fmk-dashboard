import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { Card } from 'react-md/lib/Cards';

import {  Settings, SettingsActions, SettingsStore }  from '../../components/Card/Settings';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

import dashboardMock from '../mocks/dashboards/dashboard';
import ElementConnector from '../../components/ElementConnector';

describe('Card settings store', () => {

  let dataSources: IDataSourceDictionary = {};

  let settings;

  beforeAll((done) => {
    DataSourceConnector.createDataSources(dashboardMock, dashboardMock.config.connections);
    dataSources = DataSourceConnector.getDataSources();

    setTimeout(() => {

      try {
        let {id, dependencies, source, actions, props, title, subtitle } = dashboardMock.elements[0];
        let atts = {id, dependencies, source, actions, props, title, subtitle };
        let autoRefresherElement = ElementConnector.createGenericElement(
          Settings, 
          'settings', 
          0, 
          source, 
          dependencies, 
          actions, 
          props, 
          title, 
          subtitle);
        settings = TestUtils.renderIntoDocument(autoRefresherElement);
        TestUtils.isElementOfType(settings, 'div');

        // Adding a timeout to make sure Flux cycle is complete
        setTimeout(done, 100);
        
      } catch (e) {
        return done(e);
      }

    }, 100);
  })

  it('rendering the Card\'s setting component', () => {
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(settings);
  })
});