import * as request from 'xhr-request';
import { DataSourcePlugin, IOptions } from '../DataSourcePlugin';
import { appInsightsUri } from './common';
import ApplicationInsightsConnection from '../../connections/application-insights';
import { DataSourceConnector } from '../../DataSourceConnector';

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
    let filters: Array<IFilterParams> = params.filters;

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

    return (dispatch) => {
      request(
        `${appInsightsUri}/query`,
        {
          method: 'POST',
          json: true,
          body: {
            queryTimespan,
            appId,
            apiKey,
            query,
          },
        },
        (error, json) => {
          if (error) { return this.failure(error); }
          if (json.error) {
            return json.error.code === 'PathNotFoundError' ? 
              this.failure(new Error(
                `There was a problem getting results from Application Insights. Make sure the connection string is food.
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
          var resultTables = tables.filter((aTable, idx) => {
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
            // Extracting calculated values
            let calc = queries[aTable].calculated;
            if (typeof calc === 'function') {
              var additionalValues = calc(returnedResults[aTable], dependencies, prevState) || {};
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
      var row = {};

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
        const f = 'where ' + selectedFilters.map((value) => `${queryProperty}=="${value}"`).join(' or ') + ' | ';
        q = ` ${f} \n ${q} `;
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
}