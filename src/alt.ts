import * as Alt from 'alt';
export default new Alt();

export class AbstractActions implements AltJS.ActionsClass {
  dispatch: (...payload: Array<any>) => void;
  generateActions: (...actions: string[]) => void;
  constructor(alt: AltJS.Alt) {}
}

export class AbstractStoreModel<S> implements AltJS.StoreModel<S> {
  bindListeners: (obj: any) => void;
  exportPublicMethods: (config: { [key: string]: (...args: Array<any>) => any }) => any;
  exportAsync: (source: any) => void;
  waitFor: any;
  exportConfig: any;
  getState: () => S;
}