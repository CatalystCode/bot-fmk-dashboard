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

  it('Update interval to "None"', () => {
    (SettingsActions.getExportData as any).defer(dashboardMock);
  });
});