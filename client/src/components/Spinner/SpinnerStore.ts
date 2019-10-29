import alt, { AbstractStoreModel } from '../../alt';

import { Toast, ToastActions, IToast } from '../Toast';
import spinnerActions from './SpinnerActions';

export interface ISpinnerStoreState {
  pageLoading?: number;
  requestLoading?: number;
}

const openOriginal = XMLHttpRequest.prototype.open;
const sendOriginal = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method: string, url: string, async?: boolean, _?: string, __?: string) {
  spinnerActions.startRequestLoading.defer(null);
  openOriginal.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function(data: any) {
  let _xhr: XMLHttpRequest = this;
  _xhr.onreadystatechange = (response) => {

    // readyState === 4: means the response is complete
    if (_xhr.readyState === 4) {
      spinnerActions.endRequestLoading.defer(null);

      if (_xhr.status === 429) {
        _429ApplicationInsights();
      }
    }
  };
  sendOriginal.apply(_xhr, arguments);
};

function _429ApplicationInsights() {
  let toast: IToast = { text: 'You have reached the maximum number of Application Insights requests.' };
  ToastActions.addToast(toast);
}

class SpinnerStore extends AbstractStoreModel<ISpinnerStoreState> implements ISpinnerStoreState {

  pageLoading: number;
  requestLoading: number;

  constructor() {
    super();

    this.pageLoading = 0;
    this.requestLoading = 0;

    this.bindListeners({
      startPageLoading: spinnerActions.startPageLoading,
      endPageLoading: spinnerActions.endPageLoading,
      startRequestLoading: spinnerActions.startRequestLoading,
      endRequestLoading: spinnerActions.endRequestLoading,
    });
  }
  
  startPageLoading(): void {
    this.pageLoading++;
  }

  endPageLoading(): void {
    this.pageLoading--;
  }

  startRequestLoading(): void {
    this.requestLoading++;
  }

  endRequestLoading(): void {
    this.requestLoading--;
  }
}

const spinnerStore = alt.createStore<ISpinnerStoreState>(SpinnerStore as any, 'SpinnerStore');

export default spinnerStore;
