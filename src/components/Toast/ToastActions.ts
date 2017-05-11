import alt, { AbstractActions } from '../../alt';
import { IToast } from './ToastStore';

interface IToastActions {
  addToast(toast: IToast): IToast;
  removeToast(): void;
}

class ToastActions extends AbstractActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
    this.generateActions(
      'addToast',
      'removeToast'
    );
  }
}

const toastActions = alt.createActions<IToastActions>(ToastActions);

export default toastActions;
