import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TokenInput from '../../components/common/TokenInput';
import * as TestUtils from 'react-dom/test-utils';

describe('Info drawer', () => {
  let tokenInput;
  
  it('check info drawer is loading', () => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => { return { matches: true } })
    });

    let tokensObject = [];
    tokenInput = TestUtils.renderIntoDocument(<TokenInput
      tokens={tokensObject} zDepth={0} onTokensChanged={this.onTokensChanged} />);

    TestUtils.isElementOfType(tokenInput, 'div');
  });
});