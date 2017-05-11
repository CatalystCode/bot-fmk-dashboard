import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import { Card } from 'react-md/lib/Cards';
import { DataTable, TableRow } from 'react-md/lib/DataTables';
import { Spinner, SpinnerActions } from '../../components/Spinner';
import Table from '../../components/generic/Table';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

import dataSourceMock from '../mocks/dataSource';
import tablePropsMock from '../mocks/table';

describe('Table', () => {

  let dataSources: IDataSourceDictionary = {};
  let table;

  beforeAll(() => {

    DataSourceConnector.createDataSources({ dataSources: [ dataSourceMock ]}, {});

    table = TestUtils.renderIntoDocument(<Table {...tablePropsMock} />);
    TestUtils.isElementOfType(table, 'div');
  })

  it('Render inside a Card', () => {
    let progress = TestUtils.scryRenderedComponentsWithType(table, Card);
    expect(progress.length).toBe(1);
  });

  it('Render a Data Table entity', () => {
    let progress = TestUtils.scryRenderedComponentsWithType(table, DataTable);
    expect(progress.length).toBe(1);
  });

  it('Rows == 19', () => {
    let rows = TestUtils.scryRenderedComponentsWithType(table, TableRow);
    expect(rows.length).toBe(19);
  });

  it('Rows == 25', () => {
    dataSources['data'].action.updateDependencies();
    let rows = TestUtils.scryRenderedComponentsWithType(table, TableRow);
    expect(rows.length).toBe(25);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(table);
  })
});