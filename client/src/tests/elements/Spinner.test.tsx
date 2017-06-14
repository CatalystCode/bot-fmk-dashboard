import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import { Spinner, SpinnerActions } from '../../components/Spinner';

describe('Spinner', () => {

  let spinner;

  beforeAll(() => { 
    spinner = TestUtils.renderIntoDocument(<Spinner />);
    TestUtils.isElementOfType(spinner, 'div');
  })

  it('First render without content', () => {
    let progress = TestUtils.scryRenderedComponentsWithType(spinner, CircularProgress);
    expect(progress.length).toBe(0);
  });

  it ('Start page loading', () => {
    SpinnerActions.startPageLoading();
    
    let progress = TestUtils.scryRenderedComponentsWithType(spinner, CircularProgress);
    expect(progress.length).toBe(1);
  });

  it ('Stop page loading', () => {
    SpinnerActions.endPageLoading();
    
    let progress = TestUtils.scryRenderedComponentsWithType(spinner, CircularProgress);
    expect(progress.length).toBe(0);
  });

  it ('Start request loading', () => {
    SpinnerActions.startRequestLoading();
    
    let progress = TestUtils.scryRenderedComponentsWithType(spinner, CircularProgress);
    expect(progress.length).toBe(1);
  });

  it ('Start request loading', () => {
    SpinnerActions.endRequestLoading();
    
    let progress = TestUtils.scryRenderedComponentsWithType(spinner, CircularProgress);
    expect(progress.length).toBe(0);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(spinner);
  })
});