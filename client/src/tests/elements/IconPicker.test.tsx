import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import Snackbar from 'react-md/lib/Snackbars';
import IconPicker from '../../components/Home/IconPicker';

import icons from '../../constants/icons';

const DEFAULT_ICON = 'dashboard';
const DEFAULT_ICON2 = 'view_quilt';

describe('IconPicker', () => {

  let element, element2;

  beforeAll(() => {
    element = TestUtils.renderIntoDocument(<IconPicker />);
    TestUtils.isElementOfType(element, 'div');

    element2 = TestUtils.renderIntoDocument(<IconPicker defaultIcon="view_quilt" />);
    TestUtils.isElementOfType(element2, 'div');
  });

  it('First render component', () => {
    let component = TestUtils.scryRenderedComponentsWithType(element, IconPicker);
    expect(component.length).toBe(1);
  });

  it('Should populate with icons constant', () => {
    let component = TestUtils.scryRenderedComponentsWithType(element, IconPicker);
    expect(IconPicker.listItems.length).toEqual(icons.length);
  });

  it('Default icon should be ' + DEFAULT_ICON, () => {
    let component = TestUtils.scryRenderedComponentsWithType(element, IconPicker);
    expect(component[0].getIcon()).toBe(DEFAULT_ICON);
  });

  it('Default icon should be ' + DEFAULT_ICON2, () => {
    let component = TestUtils.scryRenderedComponentsWithType(element2, IconPicker);
    expect(component[0].getIcon()).toBe(DEFAULT_ICON2);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(element);
  });

});