import alt, { AbstractStoreModel } from '../alt';
import * as _ from 'lodash';

import connections from '../data-sources/connections';
import { DataSourceConnector, IDataSourceDictionary } from '../data-sources';
import SetupActions from '../actions/SetupActions';

export interface ISetupStoreState extends ISetupConfig {
  loaded: boolean;
  saveSuccess: boolean;
}

class SetupStore extends AbstractStoreModel<ISetupStoreState> implements ISetupStoreState {

  admins: string[];
  stage: string;
  enableAuthentication: boolean;
  allowHttp: boolean;
  redirectUrl: string;
  clientID: string;
  clientSecret: string;
  issuer: string;
  loaded: boolean;
  saveSuccess: boolean;

  constructor() {
    super();

    this.admins = [];
    this.stage = '';
    this.enableAuthentication = false;
    this.allowHttp = false;
    this.redirectUrl = '';
    this.clientID = '';
    this.clientSecret = '';
    this.loaded = false;
    this.saveSuccess = false;
    this.issuer = '';

    this.bindListeners({
      load: SetupActions.load
    });
  }
  
  load(setupConfig: ISetupConfig) {

    if (setupConfig) {
      this.admins = setupConfig.admins;
      this.stage = setupConfig.stage;
      this.enableAuthentication = setupConfig.enableAuthentication;
      this.allowHttp = setupConfig.allowHttp;
      this.redirectUrl = setupConfig.redirectUrl;
      this.clientID = setupConfig.clientID;
      this.clientSecret = setupConfig.clientSecret;
      this.issuer = setupConfig.issuer;
    }
    
    this.loaded = true;
    this.saveSuccess = true;

    setTimeout(() => { this.saveSuccess = false; }, 500);
  }
}

const setupStore = alt.createStore<ISetupStoreState>(SetupStore, 'SetupStore');

export default setupStore;
