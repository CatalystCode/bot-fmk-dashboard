import * as request from 'xhr-request';

import { DataSourcePlugin, IOptions } from './DataSourcePlugin';
import AzureConnection from '../connections/azure';
import { DataSourceConnector } from '../DataSourceConnector';

let connectionType = new AzureConnection();

interface IAzureParams {
  type?: 'locations' | 'resources';
}

interface IFilterParams {
  dependency: string;
  queryProperty: string;
}

export default class Azure extends DataSourcePlugin<IAzureParams> {
  type = 'Azure';
  defaultProperty = 'values';
  connectionType = connectionType.type;

  /**
   * @param options - Options object
   * @param connections - List of available connections
   */
  constructor(options: IOptions<IAzureParams>, connections: IDict<IStringDictionary>) {
    super(options, connections);
    this.validateParams(this._props.params);
  }

  /**
   * update - called when dependencies are created
   * @param {object} dependencies
   * @param {function} callback
   */
  dependenciesUpdated(dependencies: any) {
    let emptyDependency = false;
    Object.keys(this._props.dependencies).forEach((key) => {
      if (typeof dependencies[key] === 'undefined') { emptyDependency = true; }
    });

    // If one of the dependencies is not supplied, do not run the query
    if (emptyDependency) {
      return (dispatch) => {
        return dispatch();
      };
    }

    // Validate connection
    let connection = this.getConnection();
    let { servicePrincipalId, servicePrincipalKey, servicePrincipalDomain, subscriptionId } = connection;
    if (!connection || !servicePrincipalId || !servicePrincipalKey) {
      return (dispatch) => {
        return dispatch();
      };
    }

    let params = this._props.params || {};
    let type: string;
    let apiVersion = '2016-09-01';
    switch (params.type) {
      default: 
        type = params.type;
        break;
    }

    if (type && type.indexOf('Microsoft.Billing/') >= 0) {
      apiVersion = '2017-02-27-preview';
    }

    return (dispatch) => {
      request(
        '/azure/query', 
        {
          method: 'POST',
          json: true,
          body: {
            servicePrincipalId, servicePrincipalKey, servicePrincipalDomain, subscriptionId,
            options: {
              url: `/subscriptions/${subscriptionId}/${type}?api-version=${apiVersion}`
            }
          }
        }, 
        (error, json) => {
          if (error) { return this.failure(error); }

          return dispatch({ values: json });
        }
      );
    };
  }

  updateSelectedValues(dependencies: IDictionary, selectedValues: any) {
    if (Array.isArray(selectedValues)) {
      return Object.assign(dependencies, { 'selectedValues': selectedValues });
    } else {
      return Object.assign(dependencies, { ... selectedValues });
    }
  }

  private validateParams(params: IAzureParams): void {
    return;

    // if (params.query) {
    //   if (params.table || params.queries) {
    //     throw new Error('AI query should either have { query } or { table, queries } under params.');
    //   }
    //   if (typeof params.query !== 'string' && typeof params.query !== 'function') {
    //     throw new Error('{ query } param should either be a function or a string.');
    //   }
    // }

    // if (params.table) {
    //   if (!params.queries) {
    //     return this.failure(
    //       new Error('Application Insights query should either have { query } or { table, queries } under params.')
    //     );
    //   }
    //   if (typeof params.table !== 'string' || typeof params.queries !== 'object' || Array.isArray(params.queries)) {
    //     throw new Error('{ table, queries } should be of types { "string", { query1: {...}, query2: {...} }  }.');
    //   }
    // }

    // if (!params.query && !params.table) {
    //   throw new Error('{ table, queries } should be of types { "string", { query1: {...}, query2: {...} }  }.');
    // }
  }
}