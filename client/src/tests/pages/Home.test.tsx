import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import HomeComponent from '../../components/Home';
import dashboardMock from '../mocks/dashboards/pie';
import ElementConnector from '../../components/ElementConnector';

describe('HomePage', () => {

  let homepage;

  beforeAll((done) => {

    setTimeout(() => {

      try {
        let {id, dependencies, source, actions, props, title, subtitle } = dashboardMock.elements[0];
        let atts = {id, dependencies, source, actions, props, title, subtitle };
        let homeElement = ElementConnector.createGenericElement(
          HomeComponent, 
          'home', 
          0, 
          source, 
          dependencies, 
          actions, 
          props, 
          title, 
          subtitle);
        homepage = TestUtils.renderIntoDocument(homeElement);
        TestUtils.isElementOfType(homepage, 'div');

        // Adding a timeout to make sure Flux cycle is complete
        setTimeout(done, 100);
        
      } catch (e) {
        return done(e);
      }

    }, 100);
  })

  it('Check Home page is loading', (done) => {
    // This test is just to make sure the component is able to render
    setTimeout(() => done(), 500);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(homepage);
  })
});