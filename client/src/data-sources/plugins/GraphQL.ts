import * as request from 'xhr-request';

import { DataSourcePlugin, IOptions } from './DataSourcePlugin';
import GraphQLConnection from '../connections/graphql';
import { DataSourceConnector } from '../DataSourceConnector';

let connectionType = new GraphQLConnection();

interface IGraphQLParams {
  query: string;
  variables: Object;
}

export default class GraphQL extends DataSourcePlugin<IGraphQLParams> {
  type = 'GraphQL';
  defaultProperty = 'data';
  connectionType = connectionType.type;

  constructor(options: IOptions<IGraphQLParams>, connections: IDict<IStringDictionary>) {
    super(options, connections);
    this.validateParams(this._props.params);
  }

  dependenciesUpdated(dependencies: any) {
    // Ensure dependencies exist
    const isAnyDependencyMissing = Object.keys(this.getDependencies()).some(key => dependencies[key] == null);
    if (isAnyDependencyMissing) {
      return dispatch => dispatch();
    }

    // Validate connection
    const connection = this.getConnection();
    const { serviceUrl } = connection;
    if (!connection || !serviceUrl) {
      return dispatch => dispatch();
    }

    const params = this.getParams() || ({} as IGraphQLParams);
    const query = params.query || '';
    const variables = dependencies['variables'] || params.variables;

    return dispatch => {
      request('/graphql/query', {
        method: 'POST',
        json: true,
        body: {
          serviceUrl: serviceUrl,
          query: query,
          variables: variables
        }
      },      (err, json) => {
        const error = err || (json['errors'] && json['errors'][0]);
        if (error || json['errors']) {
          return this.failure(error);
        }

        return dispatch(json);
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

  private validateParams(params: IGraphQLParams): void {
    return;
  }
}