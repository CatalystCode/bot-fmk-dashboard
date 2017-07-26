import alt, { AbstractStoreModel } from '../alt';

import accountActions from '../actions/AccountActions';

interface IAccountStoreState {
  account: IDictionary;
}

class AccountStore extends AbstractStoreModel<IAccountStoreState> implements IAccountStoreState {

  account: IDictionary;

  constructor() {
    super();

    this.account = null;

    this.bindListeners({
      updateAccount: accountActions.updateAccount
    });
  }
  
  updateAccount(state: any) {
    this.account = state.account;
  }
}

const accountStore = alt.createStore<IAccountStoreState>(AccountStore, 'AccountStore');

export default accountStore;
