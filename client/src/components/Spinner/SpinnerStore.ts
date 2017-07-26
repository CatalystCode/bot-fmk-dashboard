import alt, { AbstractStoreModel } from '../../alt';

import spinnerActions from './SpinnerActions';

export interface ISpinnerStoreState {
  pageLoading?: number;
  requestLoading?: number;
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

const spinnerStore = alt.createStore<ISpinnerStoreState>(SpinnerStore, 'SpinnerStore');

export default spinnerStore;
