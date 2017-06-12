import alt, { AbstractStoreModel } from '../../alt';

import toastActions from './ToastActions';

export interface IToast {
  text: string;
  action?: any;
}

export interface IToastStoreState {
  toasts: IToast[];
  queued: Array<IToast>;
  autohideTimeout: number;
  autohide: boolean;
}

const MIN_TIMEOUT_MS = 3000;
const AVG_WORDS_PER_SEC: number = 2;

class ToastStore extends AbstractStoreModel<IToastStoreState> implements IToastStoreState {
  toasts: IToast[];
  queued: Array<IToast>;
  autohideTimeout: number;
  autohide: boolean;

  constructor() {
    super();

    this.toasts = [];
    this.queued = Array<IToast>();
    this.autohideTimeout = MIN_TIMEOUT_MS;
    this.autohide = true;

    this.bindListeners({
      addToast: toastActions.addToast,
      removeToast: toastActions.removeToast,
    });
  }

  addToast(toast: IToast): void {
    if (this.toastExists(toast)) {
      return; // ignore dups
    }
    if (this.toasts.length === 0) {
      this.toasts.push(toast);
    } else {
      this.queued.push(toast);
    }
    this.updateSnackbarAttributes(toast);
  }

  removeToast(): void {
    if (this.queued.length > 0) {
      this.toasts = this.queued.splice(0, 1);
    } else if (this.toasts.length > 0) {
      const [, ...toasts] = this.toasts;
      this.toasts = toasts;
    }
  }

  private toastExists(toast: IToast): boolean {
    return this.toasts.findIndex(x => x.text === toast.text) > -1
        || this.queued.findIndex(x => x.text === toast.text) > -1;
  }

  private updateSnackbarAttributes(toast: IToast): void {
    const words = toast.text.split(' ').length;
    this.autohideTimeout = Math.max(MIN_TIMEOUT_MS, (words / AVG_WORDS_PER_SEC) * 1000);
    this.autohide = !toast.action;
  }
}

const toastStore = alt.createStore<IToastStoreState>(ToastStore, 'ToastStore');

export default toastStore;
