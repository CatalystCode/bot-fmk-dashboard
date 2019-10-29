import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { Card } from 'react-md/lib/Cards';
import { Scorecard, Sector, Cell, Legend, Layer } from 'recharts';

import ScorecardComponent from '../../components/generic/Scorecard';
import Tooltip from '../../components/Tooltip';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';

import dashboardMock from '../mocks/dashboards/scorecard';
import ElementConnector from '../../components/ElementConnector';

describe('scorecard', () => {

  let dataSources: IDataSourceDictionary = {};
  let scorecard;

  beforeAll((done) => {

    DataSourceConnector.createDataSources(dashboardMock, dashboardMock.config.connections);
    dataSources = DataSourceConnector.getDataSources();

    setTimeout(() => {

      try {
        let {id, dependencies, source, actions, title} = dashboardMock.elements[0];
        let atts = {id, dependencies, source, actions, title};
        let scorecardElement = ElementConnector.createGenericElement(
          ScorecardComponent, 
          'scorecard', 
          0, 
          source, 
          dependencies, 
          actions);
        scorecard = TestUtils.renderIntoDocument(scorecardElement);
        TestUtils.isElementOfType(scorecard, 'div');

        // Adding a timeout to make sure Flux cycle is complete
        setTimeout(done, 100);
        
      } catch (e) {
        return done(e);
      }

    }, 100);
  })

  it('Render inside a Card', () => {
    let card = TestUtils.scryRenderedComponentsWithType(scorecard, Card);
    expect(card.length).toBe(1);
  });

  it('Render a scorecard entity', () => {
    let scorecardElement = TestUtils.scryRenderedDOMComponentsWithClass(scorecard, "md-card-scorecard");
    expect(scorecardElement.length).toBe(1);
  });

  it('Appropriate texts', () => {
    let headline = TestUtils.scryRenderedDOMComponentsWithClass(scorecard, 'md-headline');
    expect(headline.length).toBe(1);
    expect(headline[0].textContent).toBe('3.0M');

    let subheading = TestUtils.scryRenderedDOMComponentsWithClass(scorecard, 'md-icon');
    expect(subheading.length).toBe(1);
    expect(subheading[0].textContent).toBe('av_timer');
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(scorecard);
  })
});