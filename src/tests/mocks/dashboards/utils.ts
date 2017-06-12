import * as _ from 'lodash';
import dashboard from './dashboard';

let createDashboard = (fromDashboard?: IDashboardConfig) : IDashboardConfig => _.cloneDeep(fromDashboard || dashboard);

export {
  createDashboard
};