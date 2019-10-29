import alt, { AbstractActions } from '../../alt';

interface ISpinnerActions {
  startPageLoading: AltJS.Action<any>;
  endPageLoading: AltJS.Action<any>;
  startRequestLoading: AltJS.Action<any>;
  endRequestLoading: AltJS.Action<any>;
}

class SpinnerActions extends AbstractActions /*implements ISpinnerActions*/ {
  constructor(altobj: AltJS.Alt) {
    super(altobj);

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
