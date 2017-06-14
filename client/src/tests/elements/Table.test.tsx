import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import { Card } from 'react-md/lib/Cards';
import { DataTable, TableRow } from 'react-md/lib/DataTables';
import { Spinner, SpinnerActions } from '../../components/Spinner';
import Table from '../../components/generic/Table';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

//import dataSourceMock from '../mocks/dataSource';
import dashboardMock from '../mocks/dashboards/table';

describe('Table', () => {

  let dataSources: IDataSourceDictionary = {};
  let table;

  beforeAll((done) => {

    DataSourceConnector.createDataSources(dashboardMock, dashboardMock.config.connections);
    dataSources = DataSourceConnector.getDataSources();

    let {id, dependencies, actions, props, title, subtitle } = dashboardMock.elements[0];
    let atts = {id, dependencies, actions, props, title, subtitle };
    table = TestUtils.renderIntoDocument(<Table {...(atts as any)} />);
    TestUtils.isElementOfType(table, 'div');

    setTimeout(done, 10);
  })

  it('Render inside a Card', () => {
    let card = TestUtils.scryRenderedComponentsWithType(table, Card);
    expect(card.length).toBe(1);
  });

  it('Render a Data Table entity', () => {
    let progress = TestUtils.scryRenderedComponentsWithType(table, DataTable);
    expect(progress.length).toBe(1);
  });

  it('Rows == 4', () => {
    let rows = TestUtils.scryRenderedComponentsWithType(table, TableRow);
    expect(rows.length).toBe(4);
  });

  it('Rows == 0', () => {
    dataSources['samples'].action.updateDependencies({
      values: []
    });
    let rows = TestUtils.scryRenderedComponentsWithType(table, TableRow);
    expect(rows.length).toBe(1);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(table);
  })
});