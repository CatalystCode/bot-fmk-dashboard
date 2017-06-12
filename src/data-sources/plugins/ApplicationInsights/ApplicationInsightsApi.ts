import * as request from 'xhr-request';

import { appInsightsUri } from './common';

export interface IApplicationInsightsApi {
  callQuery (query: string, callback: () => void): void;
}

export default class ApplicationInsightsApi implements IApplicationInsightsApi {
  
  constructor(private appId: string, private apiKey: string) { }
  
  callQuery(query: string, callback: (error?: Error, json?: any) => void) {
    var url = `${appInsightsUri}/${this.appId}/query`; 
    try {
      request(
        url, 
        {
          method: 'POST',
          json: true,
          headers: {
            'x-api-key': this.apiKey
          },
          body: { query }
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