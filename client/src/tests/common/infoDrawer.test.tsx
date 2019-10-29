import * as React from 'react';
import * as ReactDOM from 'react-dom';
import InfoDrawer from '../../components/common/InfoDrawer';
import * as TestUtils from 'react-dom/test-utils';

describe('Info drawer', () => {
  let infoDrawer;

  it('check info drawer is loading', () => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => { return { matches: true } })
    });

    TestUtils.renderIntoDocument(<InfoDrawer
      width={300}
      title="title"
      buttonIcon="help"
      buttonTooltip="Click here to learn more"
      buttonLabel="instructions" />);
    
    TestUtils.isElementOfType(infoDrawer, 'div');
  });
});