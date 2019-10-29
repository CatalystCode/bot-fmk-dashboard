import alt, { AbstractActions } from '../alt';
import * as request from 'xhr-request';
import { ToastActions } from '../components/Toast';
import utils from '../utils';

interface IAccountActions {
  failure(error: any): any;
  updateAccount(): any;
}

class AccountActions extends AbstractActions implements IAccountActions {

  updateAccount() {

    return (dispatcher: (account: IDictionary) => void) => {

      request('/auth/account', { json: true }, (error: any, result: any) => {
          if (error || result && result.error) {
            return this.failure(error || result && result.error);
          }
          return dispatcher({ account: result.account });
        }
      );

    };
  }

  failure(error: any) {
    ToastActions.addToast({ text: utils.errorToMessage(error) });
    return { error };
  }
}

const accountActions = alt.createActions<IAccountActions>(AccountActions);

export default accountActions;
