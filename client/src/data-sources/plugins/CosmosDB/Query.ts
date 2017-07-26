import * as request from 'xhr-request';
import { DataSourcePlugin, IOptions } from '../DataSourcePlugin';
import { DataSourceConnector } from '../../DataSourceConnector';
import CosmosDBConnection from '../../connections/cosmos-db';

let connectionType = new CosmosDBConnection();

interface IQueryParams {
  query?: ((dependencies: any) => string) | string;
  parameters?: (string | object)[];
  mappings?: (string | object)[];
  databaseId?: string;
  collectionId?: string;
  calculated?: (results: any) => object;
}

export default class CosmosDBQuery extends DataSourcePlugin<IQueryParams> {
  type = 'CosmosDB-Query';
  defaultProperty = 'Documents';
  connectionType = connectionType.type;

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
    let { host, key } = connection;
    if (!connection || !host || !key) {
      return (dispatch) => {
        return dispatch();
      };
    }

    const params = this._props.params;
    const query: string = this.compileQuery(params.query, dependencies);

    const url = `/cosmosdb/query`;
    const body = {
      host: host,
      key: key,
      verb: 'POST',
      databaseId: params.databaseId,
      collectionId: params.collectionId,
      resourceType: 'docs',
      query: query,
      parameters: params.parameters
    };

    return (dispatch) => {
      request(url, {
        method: 'POST',
        json: true,
        body: body,
      },      (error, json) => {
        if (error) {
          throw new Error(error);
        }
        if (json.code || json.message) {
          throw new Error( json.code + '\nCosmos DB query error: ' + json.message );
        }
        if (!json.Documents) {
          return dispatch();
        }
        let documents = json.Documents;
        // NB: CosmosDB prefixes certain keys with '$' which will be removed for the returned result.
        this.remap(documents);
        let returnedResults = {
          'Documents': documents || [],
          '_count': json._count || 0,
          '_rid': json._rid || undefined
        };
        return dispatch(returnedResults);
      });
    };
  }

  updateSelectedValues(dependencies: IDictionary, selectedValues: any) {
    if (Array.isArray(selectedValues)) {
      return Object.assign(dependencies, { 'selectedValues': selectedValues });
    } else {
      return Object.assign(dependencies, { ... selectedValues });
    }
  }

  private compileQuery(query: any, dependencies: any): string {
    return typeof query === 'function' ? query(dependencies) : query;
  }

  private validateTimespan(props: any) {
  }

  private validateParams(params: IQueryParams): void {
  }

  // Helper methods to strip dollar sign from JSON key names 
  private remap(json: any) {
    if (json !== null && typeof json === 'object') {
      return this.remapObject(json);
    } else if (Array.isArray(json)) {
      return this.remapArray(json);
    } else {
      return json;
    }
  }

  private remapArray(arr: any[]) {
    arr.map(this.remap);
  }

  private remapObject(obj: Object) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      this.remap(value);
      if (key.startsWith('$')) {
        const newKey = key.substr(1);
        Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, key));
        delete obj[key];
      }
    });
  }
}