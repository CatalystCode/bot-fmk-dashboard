import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import Setup from '../../components/Setup';
import SetupComponent from '../../pages/Setup'

describe('Setup', () => {
  let setup;
  let setupComponent;
  
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => { return { matches: true } })
    });
  });

  it('check setup is loading', (done) => {
    setup = TestUtils.renderIntoDocument(<Setup />);
    TestUtils.isElementOfType(setup, 'div');

    setTimeout(() => done(), 500);
  });

  it('check setup component is loading', (done) => {
    setupComponent = TestUtils.renderIntoDocument(<SetupComponent />);
    TestUtils.isElementOfType(setupComponent, 'div');

    let switchContainer = TestUtils.scryRenderedDOMComponentsWithClass(setupComponent, "md-switch-track");
    expect(switchContainer.length).toBe(1);

    setTimeout(() => done(), 500);
  });
});