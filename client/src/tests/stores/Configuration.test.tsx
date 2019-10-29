import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';

import { Toast } from '../../components/Toast';
import ConfigurationsStore from '../../stores/ConfigurationsStore';
import ConfigurationsActions from '../../actions/ConfigurationsActions';
import { mockRequests } from '../mocks/requests/configuration';
import dashboard from '../mocks/dashboards/dashboard';
import utils from '../../utils';

describe('Data Source: ConfigurationsActions', () => {

  let element;
  this.timeout = 10000;
    
  beforeAll(() => {
    element = TestUtils.renderIntoDocument(<Toast />);
    
    Object.defineProperty(window.location, 'href', {
      value: '',
      configurable: true,
      writable: true
    });
    window.location.replace = (url) => {
      window.location.href = url;
    };
  });

  beforeEach(() => {
    mockRequests();
  });

  it ('load configuration', done => {
    let checkState = (state) => {

      try {
        expect(state).toHaveProperty('dashboards');
        expect(state).toHaveProperty('templates');
        ConfigurationsStore.unlisten(checkState);
        done();
      } catch (e) {
        done.fail(e);
      }
    };

    ConfigurationsStore.listen(checkState);
    (ConfigurationsActions.loadConfiguration as any).defer();
  });

  it ('load dashboard (1) failure', done => {
    
    let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
    expect(component[0].state.toasts.length).toBe(0);
    ConfigurationsActions.loadDashboard('id_fail');

    setTimeout(
      () => {
        try {
          component = TestUtils.scryRenderedComponentsWithType(element, Toast);
          expect(component[0].state.toasts.length).toBe(1);
          component[0].setState({ toasts: [] });
          done();
        } catch (e) {
          done.fail(e);          
        }
      },
      100);
  });

  it ('load dashboard (2) success', done => {
    
    let checkState = (state) => {

      try {
        expect(state).toHaveProperty('dashboard');
        expect(state.dashboard).toHaveProperty('id');
        expect(state.dashboard.id).toBe('id');
        ConfigurationsStore.unlisten(checkState);
        done();
      } catch (e) {
        done.fail(e);
      }
    };
    
    ConfigurationsStore.listen(checkState);
    (ConfigurationsActions.loadDashboard as any)('id_success');
  });

  it ('load template (1) failure', done => {
    
    let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
    expect(component[0].state.toasts.length).toBe(0);
    ConfigurationsActions.loadTemplate('id_fail');

    setTimeout(
      () => {
        try {
          component = TestUtils.scryRenderedComponentsWithType(element, Toast);
          expect(component[0].state.toasts.length).toBe(1);
          component[0].setState({ toasts: [] });
          done();
        } catch (e) {
          done.fail(e);          
        }
      },
      10);
  });

  it ('load template (2) success', done => {
    
    let checkState = (state) => {

      try {
        expect(state).toHaveProperty('template');
        expect(state.dashboard).toHaveProperty('id');
        expect(state.dashboard.id).toBe('id');
        ConfigurationsStore.unlisten(checkState);
        done();
      } catch (e) {
        done.fail(e);
      }
    };
    
    ConfigurationsStore.listen(checkState);
    (ConfigurationsActions.loadTemplate as any)('id_success');
  });

  it ('create dashboard', done => {

    let checkState = (state) => {
      try {
        ConfigurationsStore.unlisten(checkState);
        done();
      } catch (e) {
        done.fail(e);
      }
    };

    ConfigurationsStore.listen(checkState);
    (ConfigurationsActions.createDashboard as any).defer(dashboard);
  });

  it ('save template', done => {
    
    let component = TestUtils.scryRenderedComponentsWithType(element, Toast);
    expect(component[0].state.toasts.length).toBe(0);
    ConfigurationsActions.saveAsTemplate(dashboard);
    
    setTimeout(
      () => {
        try {
          component = TestUtils.scryRenderedComponentsWithType(element, Toast);
          expect(component[0].state.toasts.length).toBe(0);
          done();
        } catch (e) {
          done.fail(e);          
        }
      },
      10);
  });

  it ('submitDashboardFile', done => {

    expect(window.location.href).toBe('');
    ConfigurationsActions.submitDashboardFile(utils.convertDashboardToString(dashboard), 'id');

    setTimeout(
      () => {
        try {
          expect(window.location.href).toBe('dashboard/id');
          done();
        } catch (e) {
          done.fail(e);
        }
      },
      10
    );

  });
});
