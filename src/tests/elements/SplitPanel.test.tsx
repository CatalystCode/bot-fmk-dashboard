import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import { Card } from 'react-md/lib/Cards';
import { Spinner, SpinnerActions } from '../../components/Spinner';
import List from 'react-md/lib/Lists/List';
import SplitPanel from '../../components/generic/SplitPanel';
import Table from '../../components/generic/Table';
import { DataTable, TableRow } from 'react-md/lib/DataTables';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

//import dataSourceMock from '../mocks/dataSource';
import dashboardMock from '../mocks/dashboards/splitpanel';

describe('SplitPanel', () => {

  let dataSources: IDataSourceDictionary = {};
  let splitpanel;

  beforeAll((done) => {

    DataSourceConnector.createDataSources(dashboardMock, dashboardMock.config.connections);
    dataSources = DataSourceConnector.getDataSources();

    let {id, dependencies, actions, props, title, subtitle } = dashboardMock.elements[0];
    let atts = {id, dependencies, actions, props, title, subtitle };
    splitpanel = TestUtils.renderIntoDocument(<SplitPanel {...(atts as any)} />);
    TestUtils.isElementOfType(splitpanel, 'div');

    setTimeout(done, 10);
  })

  it('Render inside a Card (+ Table inside a Card)', () => {
    let card = TestUtils.scryRenderedComponentsWithType(splitpanel, Card);
    expect(card).toHaveLength(2);
  });

  it('Render a List entity', () => {
    let list = TestUtils.scryRenderedComponentsWithType(splitpanel, List);
    expect(list).toHaveLength(1);
  });

  it('Render a Table entity', () => {
    let table = TestUtils.scryRenderedComponentsWithType(splitpanel, Table);
    expect(table).toHaveLength(1);
  });

  it('Rows == 4', () => {
    let rows = TestUtils.scryRenderedComponentsWithType(splitpanel, TableRow);
    expect(rows).toHaveLength(4);
  });

  it('Rows == 0', () => {
    dataSources['samples'].action.updateDependencies({
      values: []
    });
    let rows = TestUtils.scryRenderedComponentsWithType(splitpanel, Table);
    expect(rows).toHaveLength(0);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(splitpanel);
  })
});