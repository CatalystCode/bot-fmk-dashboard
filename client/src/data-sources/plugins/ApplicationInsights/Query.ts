import * as _ from 'lodash';
import * as request from 'xhr-request';
import { DataSourcePlugin, IOptions } from '../DataSourcePlugin';
import { appInsightsUri } from './common';
import ApplicationInsightsConnection from '../../connections/application-insights';
import { DataSourceConnector, IDataSource } from '../../DataSourceConnector';
import * as formats from '../../../utils/data-formats';
import ConfigurationsStore from '../../../stores/ConfigurationsStore';

let connectionType = new ApplicationInsightsConnection();

interface IQueryParams {
  query?: ((dependencies: any) => string) | string;
  mappings?: (string | object)[];
  table?: string;
  queries?: IDictionary;
  filters?: Array<IFilterParams>;
  calculated?: (results: any) => object;
}

interface IFilterParams {
  dependency: string;
  queryProperty: string;
}

export default class ApplicationInsightsQuery extends DataSourcePlugin<IQueryParams> {
  type = 'ApplicationInsights-Query';
  defaultProperty = 'values';
  connectionType = connectionType.type;

  /**
   * @param options - Options object
   * @param connections - List of available connections
   */
  constructor(options: IOptions<IQueryParams>, connections: IDict<IStringDictionary>) {
    super(options, connections);
    this.validateTimespan(this._props);
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
      // we use the 'optional_' naming convention key, to setup an optoinal dependacy.
      if (!key.startsWith('optional_') && typeof dependencies[key] === 'undefined') {
        emptyDependency = true;
      }
    });

    // If one of the dependencies is not supplied, do not run the query
    if (emptyDependency) {
      return (dispatch) => {
        return dispatch();
      };
    }

    // Validate connection
    let connection = this.getConnection();
    let { appId, apiKey } = connection;
    if (!connection || !apiKey || !appId) {
      return (dispatch) => {
        return dispatch();
      };
    }

    let { queryTimespan } = dependencies;
    let params = this._props.params;
    let tableNames: Array<string> = [];
    let mappings: Array<any> = [];
    let queries: IDictionary = {};
    let table: string = null;
    let filters: Array<IFilterParams> = params.filters || [];

    // Checking if this is a single query or a fork query
    let query: string;
    let isForked = !params.query && !!params.table;

    if (!isForked) {
      let queryKey = this._props.id;
      query = this.query(params.query, dependencies, isForked, queryKey, filters);
      mappings.push(params.mappings);
    } else {
      queries = params.queries || {};
      table = params.table;
      query = ` ${table} | fork `;

      Object.keys(queries).forEach((key) => {
        let queryParams = queries[key];
        filters = queryParams.filters || [];
        tableNames.push(key);
        mappings.push(queryParams.mappings);
        query += this.query(queryParams.query, dependencies, isForked, key, filters);
        return true;
      });
    }

    let dashboardId = ConfigurationsStore.getState().dashboard.id;

    return (dispatch) => {
      request(
        '/applicationInsights/query', 
        {
          method: 'POST',
          json: true,
          body: {
            query,
            queryTimespan,
            appId,
            dashboardId
          }
        }, 
        (error, json) => {
          if (error) { return this.failure(error); }
          if (json.error) {
            return json.error.code === 'PathNotFoundError' ? 
              this.failure(new Error(
                `There was a problem getting results from Application Insights. Make sure the connection string is good.
                ${JSON.stringify(json)}`)) : 
              this.failure(json.error);
          }

          // Check if result is valid
          let tables = this.mapAllTables(json, mappings);
          let resultStatus: IQueryStatus[] = tables[tables.length - 1];
          if (!resultStatus || !resultStatus.length) {
            return dispatch(json);
          }

          // Map tables to appropriate results
          let resultTables = tables.filter((aTable, idx) => {
            return idx < resultStatus.length && 
                    (resultStatus[idx].Kind === 'QueryResult' || resultStatus[idx].Kind === 'PrimaryResults');
          });

          let returnedResults = {
            values: (resultTables.length && resultTables[0]) || null
          };

          tableNames.forEach((aTable: string, idx: number) => {
            returnedResults[aTable] = resultTables.length > idx ? resultTables[idx] : null;
            // Get state for filter selection
            const prevState = DataSourceConnector.getDataSource(this._props.id).store.getState();

            // Extract data formats
            let format = queries[aTable].format;
            if (format) {
              format = typeof format === 'string' ? { type: format } : format;
              format = _.extend({ args: {} }, format);
              format.args = _.extend({ prefix: aTable + '-' }, format.args);
              let result = { values: returnedResults[aTable] };
              let formatExtract = DataSourceConnector.handleDataFormat(format, this, result, dependencies);
              if (formatExtract) {
                Object.assign(returnedResults, formatExtract);
              }
            }

            // Extracting calculated values
            let calc = queries[aTable].calculated;
            if (typeof calc === 'function') {
              let additionalValues = calc(returnedResults[aTable], dependencies, prevState) || {};
              Object.assign(returnedResults, additionalValues);
            }
          });

          return dispatch(returnedResults);
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

  getElementQuery(dataSource: IDataSource, dependencies: IDict<any>, partialQuery: string, queryFilters: any): string {
    let timespan = '30d';
    const table = dataSource && dataSource['config'] && dataSource['config'].params && 
      dataSource['config'].params.table || null;
    if (dependencies && dependencies['timespan'] && dependencies['timespan']['queryTimespan']) {
      timespan = dependencies['timespan']['queryTimespan'];
      timespan = this.convertApplicationInsightsTimespan(timespan);
    } else if (dependencies && dependencies['queryTimespan']) {
      // handle dialog params
      timespan = dependencies['queryTimespan'];
      timespan = this.convertApplicationInsightsTimespan(timespan);
    }
    const filter = this.formatApplicationInsightsFilterString(queryFilters, dependencies);
    const query = this.formatApplicationInsightsQueryString(partialQuery, timespan, filter, table);
    return query;
  }

  private mapAllTables(results: IQueryResults, mappings: Array<IDictionary>): any[][] {

    if (!results || !results.Tables || !results.Tables.length) {
      return [];
    }

    return results.Tables.map((table, idx) => this.mapTable(table, mappings[idx]));
  }

  /**
   * Map the AI results array into JSON objects
   * @param table Results table to be mapped into JSON object
   * @param mappings additional mappings to activate of the row
   */
  private mapTable(table: IQueryResult, mappings: IDictionary): Array<any> {
    mappings = mappings || {};

    return table.Rows.map((rowValues, rowIdx) => {
      let row = {};

      table.Columns.forEach((col, idx) => {
        row[col.ColumnName] = rowValues[idx];
      });

      // Going over user defined mappings of the values
      Object.keys(mappings).forEach(col => {
        row[col] =
          typeof mappings[col] === 'function' ?
            mappings[col](row[col], row, rowIdx) :
            mappings[col];
      });

      return row;
    });
  }

  private compileQuery(query: any, dependencies: any): string {
    return typeof query === 'function' ? query(dependencies) : query;
  }

  private query(query: any, dependencies: any, isForked: boolean, queryKey: string, filters: IFilterParams[]): string {
    let q = this.compileQuery(query, dependencies);
    // Don't filter a filter query, or no filters specified
    if (queryKey.startsWith('filter') || filters === undefined || filters.length === 0) {
      return this.formatQuery(q, isForked);
    }
    // Apply selected filters to connected query
    filters.every((filter) => {
      const { dependency, queryProperty } = filter;
      const selectedFilters = dependencies[dependency] || [];
      if (selectedFilters.length > 0) {
        const f = 'where ' + selectedFilters.map((value) => `${queryProperty}=="${value}"`).join(' or ');
        q = isForked ? ` ${f} |\n ${q} ` : q.replace(/^(\s?\w+\s*?){1}(.)*/gim, '$1 | ' + f + ' $2');
        return true;
      }
      return false;
    });
    return this.formatQuery(q, isForked);
  }

  private formatQuery(query: string, isForked: boolean = true) {
    return isForked ? ` (${query}) \n\n` : query;
  }

  private validateTimespan(props: any) {
    if (!props.dependencies.queryTimespan) {
      throw new Error('AIAnalyticsEvents requires dependencies: timespan; queryTimespan');
    }
  }

  private validateParams(params: IQueryParams): void {
    if (params.query) {
      if (params.table || params.queries) {
        throw new Error('Application Insights query should either have { query } or { table, queries } under params.');
      }
      if (typeof params.query !== 'string' && typeof params.query !== 'function') {
        throw new Error('{ query } param should either be a function or a string.');
      }
    }

    if (params.table) {
      if (!params.queries) {
        return this.failure(
          new Error('Application Insights query should either have { query } or { table, queries } under params.')
        );
      }
      if (typeof params.table !== 'string' || typeof params.queries !== 'object' || Array.isArray(params.queries)) {
        throw new Error('{ table, queries } should be of types { "string", { query1: {...}, query2: {...} }  }.');
      }
    }

    if (!params.query && !params.table) {
      throw new Error('{ table, queries } should be of types { "string", { query1: {...}, query2: {...} }  }.');
    }
  }

  // element export formatting functions
  private formatApplicationInsightsQueryString(query: string, timespan: string, filter: string, table?: string) {
    let str = query.replace(/(\|)((\s??\n\s??)(.+?))/gm, '\n| $4'); // move '|' to start of each line
    str = str.replace(/(\s?\|\s?)([^\|])/gim, '\n| $2'); // newline on '|'
    str = str.replace(/(\sand\s)/gm, '\n $1'); // newline on 'and'
    str = str.replace(/([^\(\'\"])(,\s*)(?=(\w+[^\)\'\"]\w+))/gim, '$1,\n  '); // newline on ','
    const timespanQuery = '| where timestamp > ago(' + timespan + ') \n';
    // Checks for '|' at start
    const matches = str.match(/^(\s*\||\s*\w+\s*\|)/ig); 
    const start = (!matches || matches.length !== 1) ? '| ' : '';
    if (table) {
      str = table + ' \n' + timespanQuery + filter + start + str;
    } else {
      // Insert timespan and filter after table name
      str = str.replace(/^\s*(\w+)\s*/gi, '$1 \n' + timespanQuery + filter + start); 
    }
    return str;
  }

  private formatApplicationInsightsFilterString(filters: IStringDictionary[], dependencies: IDict<any>) {
    let str = '';
    if (!filters) {
      return str;
    }
    // Apply selected filters to connected query
    filters.forEach((filter) => {
      const { dependency, queryProperty } = filter;
      const selectedFilters: string[] = dependencies[dependency] || [];
      if (selectedFilters.length > 0) {
        const f = '| where ' + selectedFilters.map((value) => `${queryProperty}=="${value}"`).join(' or ');
        str = `${str}${f} \n`;
      }
    });
    return str;
  }

  private convertApplicationInsightsTimespan(timespan: string) {
    let str = timespan;
    if (timespan.substr(0, 2) === 'PT') {
      str = str.substring(2).toLowerCase();
    } else if (timespan.substr(0, 1) === 'P') {
      str = str.substring(1).toLowerCase();
    }
    return str;
  }

}