import alt, { AbstractActions } from '../alt';
import * as request from 'xhr-request';
import {IToast, ToastActions} from '../components/Toast';

interface ISetupActions {
  load(): any;
  save(setupConfig: ISetupConfig, successCallback: () => void): any;
  failure(error: any): void;
}

class SetupActions extends AbstractActions implements ISetupActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  load() {
    
    return (dispatcher: (setupConfig: ISetupConfig) => void) => {
      
      request('/api/setup', { json: true }, (setupError: any, setupConfig: ISetupConfig) => {
          return dispatcher(setupConfig);
        });
    };
  }

  save(setupConfig: ISetupConfig, successCallback: () => void) {
    return (dispatcher: (setupConfig: ISetupConfig) => void) => {

      setupConfig.stage = 'configured';
      let stringConfig = JSON.stringify(setupConfig);
      
      request('/api/setup', {
          method: 'POST',
          json: true,
          body: { json: stringConfig }
        }, 
              (setupError: any, setupJson: any) => {

          if (setupError) {
            return this.failure(setupError);
          }

          return request('/auth/init', 
                         (authError: any, authJson: any) => {

              if (authError) {
                return this.failure(authError);
              }

              let toast: IToast = { text: 'Setup was saved successfully.' };
              ToastActions.addToast(toast);

              try {
                if (successCallback) {
                  successCallback();
                }
              } catch (e) { }

              return dispatcher(authJson);
            }
          );
        }
      );
    };    
  }

  failure(error: any) {
    return { error };
  }
}

const setupActions = alt.createActions<ISetupActions>(SetupActions);

export default setupActions;
