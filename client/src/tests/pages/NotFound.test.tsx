import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import NotFound from '../../pages/NotFound';

describe('NotFound', () => {
  let setup;
  let setupComponent;

  it('not found is loading', () => {
    setup = TestUtils.renderIntoDocument(<NotFound />);
    TestUtils.isElementOfType(setup, 'div');
  });
});