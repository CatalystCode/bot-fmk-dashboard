import alt, { AbstractActions } from '../../alt';
import { IToast } from './ToastStore';

interface IToastActions {
  showText(test: string): IToast;
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

  addToast(toast: IToast): IToast {
    return toast;  
  }

  showText(text: string): IToast {
    return this.addToast({ text });
  }
}

const toastActions = alt.createActions<IToastActions>(ToastActions);

export default toastActions;
