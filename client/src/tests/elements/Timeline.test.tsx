import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { Card } from 'react-md/lib/Cards';

import TimelineComponent from '../../components/generic/Timeline';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

import dashboardMock from '../mocks/dashboards/timeline';
import ElementConnector from '../../components/ElementConnector';

describe('Timeline', () => {

  let dataSources: IDataSourceDictionary = {};
  let timeline;

  beforeAll((done) => {

    DataSourceConnector.createDataSources(dashboardMock, dashboardMock.config.connections);
    dataSources = DataSourceConnector.getDataSources();

    setTimeout(() => {

      try {
        let {id, dependencies, source, actions, title } = dashboardMock.elements[0];
        let atts = {id, dependencies, source, actions, title };
        let timelineElement = ElementConnector.createGenericElement(
          TimelineComponent, 
          'timeline', 
          0, 
          source, 
          dependencies, 
          actions,
          null, 
          title);
        timeline = TestUtils.renderIntoDocument(timelineElement);
        TestUtils.isElementOfType(timeline, 'div');

        // Adding a timeout to make sure Flux cycle is complete
        setTimeout(done, 100);
        
      } catch (e) {
        return done(e);
      }

    }, 100);
  })

  it('Render inside a Card', () => {
    let card = TestUtils.scryRenderedComponentsWithType(timeline, Card);
    expect(card.length).toBe(1);
  });

  it('Render a timeline entity', () => {
    let timelineElement = TestUtils.scryRenderedDOMComponentsWithClass(timeline, "md-card");
    expect(timelineElement.length).toBe(1);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(timeline);
  })
});