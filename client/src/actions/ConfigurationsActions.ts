import alt, { AbstractActions } from '../alt';
import * as request from 'xhr-request';

import { ToastActions } from '../components/Toast';
import utils from '../utils'; 

interface IConfigurationsActions {
  loadConfiguration(): any;
  loadDashboard(id: string): any;
  loadDashboardComplete(dashboard: IDashboardConfig): { dashboard: IDashboardConfig };
  createDashboard(dashboard: IDashboardConfig): any;
  loadTemplate(id: string): any;
  saveConfiguration(dashboard: IDashboardConfig): any;
  failure(error: any): any;
  submitDashboardFile(content: string, fileName: string): void;
  convertDashboardToString(dashboard: IDashboardConfig): string;
  deleteDashboard(id: string): any;
  saveAsTemplate(template: IDashboardConfig): any;
}

class ConfigurationsActions extends AbstractActions implements IConfigurationsActions {

  submitDashboardFile(content: string, dashboardId: string) {
    return (dispatcher: (json: any) => void) => {

      // Replace both 'id' and 'url' with the requested id from the user
      const idRegExPattern = /id: \".*\",/i;
      const urlRegExPatternt = /url: \".*\",/i;
      const updatedContent =
        content.replace(idRegExPattern, 'id: \"' + dashboardId + '\",')
               .replace(urlRegExPatternt, 'url: \"' + dashboardId + '\",');

      request(
        '/api/dashboards/' + dashboardId,
        {
          method: 'PUT',
          json: true,
          body: { script: updatedContent }
        },
        (error: any, json: any) => {
          if (error || (json && json.errors)) {
            return this.failure(error || json.errors);
          }
          
          // redirect to the newly imported dashboard
          window.location.replace('dashboard/' + dashboardId);
          return dispatcher(json);
        }
      );
    };
  }

  loadConfiguration() {
    
    return (dispatcher: (result: { dashboards: IDashboardConfig[], templates: IDashboardConfig[] }) => void) => {
      
      this.getScript('/api/dashboards', () => {
        let dashboards: IDashboardConfig[] = (window as any)['dashboardDefinitions'];
        let templates: IDashboardConfig[] = (window as any)['dashboardTemplates'];

        if ((!dashboards || !dashboards.length) && (!templates || !templates.length)) {
          return this.failure(new Error('Could not load configuration'));
        }

        return dispatcher({ dashboards, templates });
      });
    };
  }

  loadDashboard(id: string) {
    
    return (dispatcher: () => void) => {
      (window as any)['dashboard'] = undefined;
      this.getScript('/api/dashboards/' + id, () => {
        let dashboard: IDashboardConfig = (window as any)['dashboard'];

        if (!dashboard) {
          return this.failure(new Error('Could not load configuration for dashboard ' + id));
        }

        this.loadDashboardComplete(dashboard);
        return dispatcher();
      });
    };
  }

  loadDashboardComplete(dashboard: IDashboardConfig): { dashboard: IDashboardConfig } {
    return { dashboard };
  }

  createDashboard(dashboard: IDashboardConfig) {
    return (dispatcher: (dashboard: IDashboardConfig) => void) => {

      let script = utils.objectToString(dashboard);
      request('/api/dashboards/' + dashboard.id, {
          method: 'PUT',
          json: true,
          body: { script: 'return ' + script }
        }, 
              (error: any, json: any) => {

          if (error || (json && (json.error || json.errors))) {
            return this.failure(error || json);
          }

          return dispatcher(json);
        }
      );
    };
  }

  loadTemplate(id: string) {
    
    return (dispatcher: (result: { template: IDashboardConfig }) => void) => {
      
      (window as any)['template'] = undefined;
      this.getScript('/api/templates/' + id, () => {
        let template: IDashboardConfig = (window as any)['template'];

        if (!template) {
          return this.failure(new Error('Could not load configuration for template ' + id));
        }

        return dispatcher({ template });
      });
    };
  }

  saveAsTemplate(template: IDashboardConfig) {
    
    return (dispatcher: (result: { template: IDashboardConfig }) => void) => {
      let script = utils.objectToString(template);
      
      script = '/// <reference path="../../../client/@types/types.d.ts"/>\n' +
              'import * as _ from \'lodash\';\n\n' +
              'export const config: IDashboardConfig = /*return*/ ' + script;
      return request(
        '/api/templates/' + template.id, 
        {
          method: 'PUT',
          json: true,
          body: { script: script }
        }, 
        (error: any, json: any) => {

          if (error || (json && json.errors)) {
            return this.failure(error || json.errors);
          }

          return dispatcher(json);
        }
      );
    };
  }

  saveConfiguration(dashboard: IDashboardConfig) {
    return (dispatcher: (dashboard: IDashboardConfig) => void) => {

      let stringDashboard = utils.objectToString(dashboard);
      
      request('/api/dashboards/' + dashboard.id, {
          method: 'POST',
          json: true,
          body: { script: 'return ' + stringDashboard }
        }, 
              (error: any, json: any) => {

          if (error) {
            return this.failure(error);
          }

          // Request a reload of the configuration
          this.loadDashboard(dashboard.id);

          return dispatcher(json);
        }
      );
    };    
  }

  failure(error: any) {
    ToastActions.showText(JSON.stringify(error || 'There was an error'));
    return error;
  }

  deleteDashboard(id: string) {
    return (dispatcher: (result: any) => any) => {
      request('/api/dashboards/' + id, {
        method: 'DELETE',
        json: true
      }, 
              (error: any, json: any) => {
          if (error || (json && json.errors)) {
            return this.failure(error || json.errors);
          }

          return dispatcher(json.ok);
        }
      );
    };
  }

  convertDashboardToString(dashboard: IDashboardConfig) {
    return utils.convertDashboardToString(dashboard);
  }

  private getScript(source: string, callback?: () => void): boolean {
    let script: any = document.createElement('script');
    let prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    if (prior) {
      prior.parentNode.insertBefore(script, prior);
    } else {
      document.getElementsByTagName('body')[0].appendChild(script);
    }

    script.onload = script.onreadystatechange = (_, isAbort) => {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
        script.onload = script.onreadystatechange = null;
        script = undefined;

        if (!isAbort) { if (callback) { callback(); } }
      }
    };

    script.src = source;
    return true;
  }
}

const configurationsActions = alt.createActions<IConfigurationsActions>(ConfigurationsActions);

export default configurationsActions;
