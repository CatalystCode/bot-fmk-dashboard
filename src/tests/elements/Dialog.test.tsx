import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import { Dialog, DialogsActions, loadDialogsFromDashboard } from '../../components/generic/Dialogs';
import MDDialog from 'react-md/lib/Dialogs';

import emptyDashboard from '../mocks/dashboards/dashboard';
import dashboardWithDialog from '../mocks/dashboards/dialogs';
import dialogData from '../mocks/dialog';

describe('Dialog', () => {

  let dialog;

  it('Load empty dialogs', () => {
    let dialogs = loadDialogsFromDashboard(emptyDashboard);
    expect(dialogs).toHaveLength(0);
  });

  it('Dynamic loading of 1 dialog', () => {
    let dialogs = loadDialogsFromDashboard(dashboardWithDialog);
    expect(dialogs).toHaveLength(1);
  });

  it('First render without content', () => {
    dialog = TestUtils.renderIntoDocument(<Dialog dialogData={dialogData} dashboard={dashboardWithDialog} />);
    let elements = TestUtils.scryRenderedComponentsWithType(dialog, MDDialog);
    expect(elements.length).toBe(0);
  });

  it('Opening a dialog', function () {
    DialogsActions.openDialog(dialogData.id, { title: 'Title', intent: 'Intent', queryspan: '30D' });
    let elements = TestUtils.scryRenderedComponentsWithType(dialog, MDDialog);
    expect(elements.length).toBe(1);
  });

  it('Closing a dialog', function () {
    DialogsActions.closeDialog();
    let elements = TestUtils.scryRenderedComponentsWithType(dialog, MDDialog);
    expect(elements.length).toBe(0);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(dialog);
  })
});