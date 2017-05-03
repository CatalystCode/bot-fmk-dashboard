
//import * as request from 'request';
import * as _ from 'lodash';
import {DataSourcePlugin, IDataSourceOptions} from '../DataSourcePlugin';
//import ActionsCommon from './actions-common';
import { appInsightsUri } from './common';
import { IDict, IStringDictionary } from '../../../types';

declare var process : any;

interface IEventsConfig {
  /** @type {string} */
  timespan;
}

interface IEventsParams {
  /** @type {string} */
  query;
  /** @type {(string|object)[]} mappings */
  mappings;
}

export default class ApplicationInsightsEvents extends DataSourcePlugin<IEventsParams> {

  type = 'ApplicationInsights-Events';
  defaultProperty = 'values';

  constructor(options: IEventsParams, connections: IDict<IStringDictionary>) {
    super(options, connections);

    // var props = this._props;
    // var params: any = props.params;
    // if (!params.query || !props.dependencies || !props.dependencies.length) {
    //   throw new Error('AIAnalyticsEvents requires a query to run and dependencies that trigger updates.');
    // }
  }

  /**
   * update - called when dependencies are created
   * @param {object} dependencies
   * @param {function} callback
   */
  updateDependencies(dependencies, callback) {

    // var {
    //   timespan,
    //   eventType,
    //   search,
    //   top,
    //   skip
    // } = dependencies;

    // eventType = eventType || 'customEvents'; // traces; customEvents; exceptions; etc...

    // var queryspan = ActionsCommon.timespanToQueryspan(timespan);
    // var url = `${appInsightsUri}/${ActionsCommon.appInsightsAppId}/events/${eventType}?timespan=${queryspan}` +
    //   search ? `&$search=${encodeURIComponent(search)}` : '' +
    //   `&&$orderby=timestamp` +
    //   top ? `&$top=${top}` : '' +
    //   skip ? `&$skip=${skip}` : '';

    // request({
    //     url,
    //     method: "GET",
    //     headers: {
    //       "x-api-key": ActionsCommon.appInsightsApiKey
    //     }
    //   }, 
    //   (error, json) => {

    //     if (error) {
    //       return this.failure(error);
    //     }

    //     return callback(null, ActionsCommon.prepareResult('value', json));
    //   });
  }

  updateSelectedValues(dependencies, callback) {
    
  }
}