import alt, { AbstractActions } from '../alt';
import * as request from 'xhr-request';

interface IAccountActions {
  failure(error: any): any;
  updateAccount(): any;
}

class AccountActions extends AbstractActions implements IAccountActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  updateAccount() {

    return (dispatcher: (account: IDictionary) => void) => {

      request('/auth/account', { json: true }, (error: any, result: any) => {
          if (error) {
            return this.failure(error);
          }
          return dispatcher({ account: result.account });
        }
      );

    };
  }

  failure(error: any) {
    return { error };
  }
}

const accountActions = alt.createActions<IAccountActions>(AccountActions);

export default accountActions;
