import * as request from 'xhr-request';

import { appInsightsUri } from './common';

export interface IApplicationInsightsApi {
  callQuery (query: string, callback: () => void): void;
}

export default class ApplicationInsightsApi implements IApplicationInsightsApi {
  
  constructor(private appId: string, private apiKey: string) { }
  
  callQuery(query: string, callback: (error?: Error, json?: any) => void) {
    try {
      request(
        `${appInsightsUri}/query`,
        {
          method: 'POST',
          json: true,
          body: {
            apiKey: this.apiKey,
            appId: this.appId,
            query,
          },
        },
        (error: Error, json: any) => {
          if (error) {
            callback(error);
          }
        
          callback(null, json);
        }
      );
    } catch (ex) {
      callback(ex);
    }
  }
}