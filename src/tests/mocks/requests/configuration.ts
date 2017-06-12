import * as nock from 'nock';
import dashboard from '../dashboards/dashboard';

function mockRequests() {

  nock('http://localhost')
    .get('/api/dashboards')
    .reply(200, `
      (function (window) {
        var dashboardTemplate = (function () {
          return ${JSON.stringify(dashboard)};
        })();
        window.dashboardTemplates = window.dashboardTemplates || [];
        window.dashboardTemplates.push(dashboardTemplate);
      })(window);
      (function (window) {
        var dashboard = (function () {
          return ${JSON.stringify(dashboard)};
        })();
        window.dashboardDefinitions = window.dashboardDefinitions || [];
        window.dashboardDefinitions.push(dashboard);
      })(window);
      (function (window) {
        var dashboard = (function () {
          return ${JSON.stringify(dashboard)};
        })();
        window.dashboard = dashboard || null;
      })(window);
    `);
}
export {
  mockRequests
};