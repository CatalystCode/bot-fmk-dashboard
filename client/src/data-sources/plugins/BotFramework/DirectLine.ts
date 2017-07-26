import * as request from 'xhr-request';
import { DataSourcePlugin, IOptions } from '../DataSourcePlugin';
import { DataSourceConnector } from '../../DataSourceConnector';
import BotFrameworkConnection from '../../connections/bot-framework';

let connectionType = new BotFrameworkConnection();

const DIRECT_LINE_URL = 'https://directline.botframework.com/v3/directline/conversations';

interface IQueryParams {
  calculated?: (results: any) => object;
}

export default class BotFrameworkDirectLine extends DataSourcePlugin<IQueryParams> {
  type = 'BotFramework-DirectLine';
  defaultProperty = 'values';
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
    let connection = this.getConnection() || {};
    let { directLine } = connection;
    if (!connection || !directLine) {
      return (dispatch) => {
        return dispatch();
      };
    }

    const bearerToken = `Bearer ${directLine}`;

    return (dispatch) => {
      request(DIRECT_LINE_URL, {
        method: 'POST',
        json: true,
        headers: { 'Authorization' : bearerToken }
      },      (error: any, json: any) => {
        if (error) {
          throw new Error(error);
        }
        // returns conversationId, token, expires_in, streamUrl, referenceGrammarId
        return dispatch(json); 
      });
    };
  }

  updateSelectedValues(dependencies: IDictionary, selectedValues: any) {
    if (Array.isArray(selectedValues)) {
      return Object.assign(dependencies, { selectedValues });
    } else {
      return Object.assign(dependencies, { ... selectedValues });
    }
  }

  private validateTimespan(props: any) {
  }

  private validateParams(params: IQueryParams): void {
  }

}