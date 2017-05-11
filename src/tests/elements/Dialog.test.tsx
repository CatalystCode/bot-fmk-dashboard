import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import { Dialog, DialogsActions } from '../../components/generic/Dialogs';
import MDDialog from 'react-md/lib/Dialogs';

import dashboard from '../mocks/dashboard';
import dialogData from '../mocks/dialog';

describe('Dialog', () => {

  let dialog;

  it('First render without content', () => {
    dialog = TestUtils.renderIntoDocument(<Dialog dialogData={dialogData} dashboard={dashboard} />);
    let elements = TestUtils.scryRenderedComponentsWithType(dialog, MDDialog);
    expect(elements.length).toBe(0);
  });

  it('Opening a dialog', function () {
    DialogsActions.openDialog(dialogData.id, { title: 'Title', intent: 'Intent', queryspan: '30D' });
    let elements = TestUtils.scryRenderedComponentsWithType(dialog, MDDialog);
    expect(elements.length).toBe(1);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(dialog);
  })
});