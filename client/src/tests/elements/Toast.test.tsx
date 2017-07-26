import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import Snackbar from 'react-md/lib/Snackbars';
import { Toast, IToast, ToastActions } from '../../components/Toast';

const TEST_TOAST_1: IToast = {
    text: "first test toast"
};
const TEST_TOAST_2: IToast = {
    text: "second test toast"
};

describe('Toast', () => {

    let element;

    beforeAll(() => {
        element = TestUtils.renderIntoDocument(<Toast />);
        TestUtils.isElementOfType(element, 'div');
    });

    it('First render component', () => {
        let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
        expect(component.length).toBe(1);
    });

    it('First render without toasts', () => {
        let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
        expect(component[0].state.toasts.length).toBe(0);
    });

    it('Render after adding toast', () => {
        let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
        ToastActions.addToast(TEST_TOAST_1);
        expect(component[0].state.toasts.length).toBe(1);
    });

    it('Render only once after adding duplicate toast', () => {
        let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
        ToastActions.addToast(TEST_TOAST_1);
        ToastActions.addToast(TEST_TOAST_1);
        expect(component[0].state.toasts.length).toBe(1);
    });

    it('Render add subsequent toasts to queue', () => {
        let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
        ToastActions.addToast(TEST_TOAST_1);
        ToastActions.addToast(TEST_TOAST_2);
        expect(component[0].state.toasts.length && component[0].state.queued.length).toBe(1);
    });

    afterAll(() => {
        ReactDOM.unmountComponentAtNode(element);
    });

});