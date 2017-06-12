import alt, { AbstractActions } from '../../alt';

interface ISpinnerActions {
  startPageLoading(): void;
  endPageLoading(): void;
  startRequestLoading(): void;
  endRequestLoading(): void;
}

class SpinnerActions extends AbstractActions /*implements ISpinnerActions*/ {
  constructor(alt: AltJS.Alt) {
    super(alt);

    this.generateActions(
      'startPageLoading',
      'endPageLoading',
      'startRequestLoading',
      'endRequestLoading'
    );
  }
}

const spinnerActions = alt.createActions<ISpinnerActions>(SpinnerActions);

export default spinnerActions;
