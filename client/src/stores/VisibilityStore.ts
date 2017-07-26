import alt, { AbstractStoreModel } from '../alt';

import visibilityActions from '../actions/VisibilityActions';

class VisibilityStore extends AbstractStoreModel<any> {

  flags: IDict<boolean>;

  constructor() {
    super();

    this.flags = {};

    this.bindListeners({
      updateFlags: [visibilityActions.turnFlagOn, visibilityActions.turnFlagOff, visibilityActions.setFlags]
    });
  }
  
  updateFlags(flags: any) {
    if (flags) {
      Object.keys(flags).forEach(flag => {
        this.flags[flag] = flags[flag];
      });
    }
  }
}

const visibilityStore = alt.createStore<any>(VisibilityStore, 'VisibilityStore');

export default visibilityStore;
