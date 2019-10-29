import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import Home from '../../pages/Home'

describe('Home', () => {
  let setup;
  let setupComponent;

  it('Home is loading', (done) => {
    setup = TestUtils.renderIntoDocument(<Home />);
    TestUtils.isElementOfType(setup, 'div');

    setTimeout(() => done(), 500);
  });
});