import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { Toast } from '../../components/Toast';
import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';
import { mockRequests } from '../mocks/requests/account';

describe('Data Source: Samples', () => {

  let element;
  
  beforeAll(() => {
    element = TestUtils.renderIntoDocument(<Toast />);
    mockRequests();
  });

  it ('AccountActions failure', done => {

    let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
    expect(component[0].state.toasts.length).toBe(0);
    AccountActions.updateAccount();

    setTimeout(
      () => {
        try {
          component = TestUtils.scryRenderedComponentsWithType(element, Toast);
          expect(component[0].state.toasts.length).toBe(1);
          done();
        } catch (e) {
          done.fail(e);          
        }
      },
      10);
  });

  it ('Testing AccountActions', done => {

    const stateUpdate = (state) => {
      expect(state).toHaveProperty('account');
      AccountStore.unlisten(stateUpdate);
      done();
    };
    AccountStore.listen(stateUpdate);
    AccountActions.updateAccount();
  });
});
