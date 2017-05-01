import alt, { AbstractActions } from '../alt';
import * as request from 'xhr-request';

interface IConfigurationsActions {
  loadConfiguration(): any;
  loadDashboard(id: string): any;
  createDashboard(dashboard: IDashboardConfig): any;
  loadTemplate(id: string): any;
  saveConfiguration(dashboard: IDashboardConfig): any;
  failure(error: any): void;
}

class ConfigurationsActions extends AbstractActions implements IConfigurationsActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  loadConfiguration() {
    
    return (dispatcher: (result: { dashboards: IDashboardConfig[], templates: IDashboardConfig[] }) => void) => {
      
      this.getScript('/api/dashboards', () => {
        let dashboards: IDashboardConfig[] = (window as any)['dashboardDefinitions'];
        let templates: IDashboardConfig[] = (window as any)['dashboardTemplates'];

        if (!dashboards || !dashboards.length) {
          return this.failure(new Error('Could not load configuration'));
        }

        return dispatcher({ dashboards, templates });
      });
    };
  }

  loadDashboard(id: string) {
    
    return (dispatcher: (result: { dashboard: IDashboardConfig }) => void) => {
      
      this.getScript('/api/dashboards/' + id, () => {
        let dashboard: IDashboardConfig = (window as any)['dashboard'];

        if (!dashboard) {
          return this.failure(new Error('Could not load configuration for dashboard ' + id));
        }

        return dispatcher({ dashboard });
      });
    };
  }

  createDashboard(dashboard: IDashboardConfig) {
    return (dispatcher: (dashboard: IDashboardConfig) => void) => {

      let script = this.objectToString(dashboard);
      request('/api/dashboards/' + dashboard.id, {
          method: 'PUT',
          json: true,
          body: { script: 'return ' + script }
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

  loadTemplate(id: string) {
    
    return (dispatcher: (result: { template: IDashboardConfig }) => void) => {
      
      this.getScript('/api/templates/' + id, () => {
        let template: IDashboardConfig = (window as any)['template'];

        if (!template) {
          return this.failure(new Error('Could not load configuration for template ' + id));
        }

        return dispatcher({ template });
      });
    };
  }

  saveConfiguration(dashboard: IDashboardConfig) {
    return (dispatcher: (dashboard: IDashboardConfig) => void) => {

      let stringDashboard = this.objectToString(dashboard);
      
      request('/api/dashboards/' + dashboard.id, {
          method: 'POST',
          json: true,
          body: { script: 'return ' + stringDashboard }
        }, 
        (error: any, json: any) => {

          if (error) {
            return this.failure(error);
          }

          return dispatcher(json);
        }
      );
    };    
  }

  failure(error: any) {
    return { error };
  }

  private getScript(source: string, callback?: () => void): void {
    let script: any = document.createElement('script');
    let prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    prior.parentNode.insertBefore(script, prior);

    script.onload = script.onreadystatechange = (_, isAbort) => {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
        script.onload = script.onreadystatechange = null;
        script = undefined;

        if (!isAbort) { if (callback) { callback(); } }
      }
    };

    script.src = source;
  }

  /**
   * Convret a json object with functions to string
   * @param obj an object with functions to convert to string
   */
  private objectToString(obj: Object, indent: number = 0, lf: boolean = false): string {
    
    let result = ''; //(lf ? '\n' : '') + '\t'.repeat(indent);
    let sind = '\t'.repeat(indent);
    let objectType = (Array.isArray(obj) && 'array') || typeof obj;
    
    switch (objectType) {
      case 'object': {

        // Iterating through all values in object
        let objectValue = '';
        Object.keys(obj).forEach((key: string, idx: number) => {

          if (idx > 0) { objectValue += ',\n'; }

          let value = this.objectToString(obj[key], indent + 1, true);

          // if key contains '.' or '-'
          let skey = key.search(/\.|\-/g) >= 0 ? `"${key}"` : `${key}`;

          objectValue += `${sind}\t${skey}: ${value}`;
        });

        result += `{\n${objectValue}\n${sind}}`;
        break;
      }

      case 'string':
        let stringValue = obj.toString().replace(/\"/g, '\\"');
        result += `"${stringValue}"`;
        break;

      case 'function': {
        result += obj.toString();
        break;
      }

      case 'number':
      case 'boolean': {
        result += `${obj}`;
        break;
      }

      case 'array': {
        let arrayValue = '';
        (obj as any[]).forEach((value: any, idx: number) => {
          arrayValue += idx > 0 ? ',' : '';
          arrayValue += this.objectToString(value, indent + 1, true);
        });
        
        result += `[${arrayValue}]`;
        break;
      }

      case 'undefined': {
        result += `undefined`;
        break;
      }

      default:
        throw new Error('An unhandled type was found: ' + typeof objectType);
    }

    return result;
  }

  /**
   * convert a string to object (with strings)
   * @param str a string to turn to object with functions
   */
  private stringToObject(str: string): Object {
    // we doing this recursively so after the first one it will be an object
    let parsedString: Object;
    try {
      parsedString = JSON.parse(`{${str}}`);
    } catch (e) {
      parsedString = str;
    }
    
    var obj = {};
    for (var i in parsedString) {
      if (typeof parsedString[i] === 'string') {
        if (parsedString[i].substring(0, 8) === 'function') {
          eval('obj[i] = ' + parsedString[i] ); /* tslint:disable-line */

        } else {
          obj[i] = parsedString[i];
        }

      } else if (typeof parsedString[i] === 'object') {
        obj[i] = this.stringToObject(parsedString[i]);
      }
    }
    return obj;
  }

  private fixCalculatedProperties(dashboard: IDashboardConfig): void {
    dashboard.dataSources.forEach(dataSource => {
      let calculated: string = dataSource.calculated as any;
      if (calculated) {
        if (!calculated.startsWith('function(){return')) {
          throw new Error('calculated function format is not recognized: ' + calculated);
        }

        calculated = calculated.substr('function(){return'.length, calculated.length - 'function(){return'.length - 1);
        eval('dataSource.calculated = ' + calculated); /* tslint:disable-line */
      }
    })
  }
}

const configurationsActions = alt.createActions<IConfigurationsActions>(ConfigurationsActions);

export default configurationsActions;
