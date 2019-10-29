import alt, { AbstractActions } from '../../alt';
import * as request from 'xhr-request';

interface IRefreshActions {
  updateInterval(newInterval: number): { refreshInterval: number };
  setRefreshTimer(newInterval: any, cb: any): void;
}

class RefreshActions extends AbstractActions implements IRefreshActions {
    
  private runningRefreshInterval: any;

  constructor(altobj: AltJS.Alt) {
    super(altobj);

    this.setRefreshTimer = this.setRefreshTimer.bind(this);
  }

  updateInterval(newInterval: number) {
    
    return { refreshInterval: newInterval };
  }

  setRefreshTimer(newInterval: any, cb: any) {
    return (dispatch) => {
      // clear any previously scheduled interval
      if (this.runningRefreshInterval) {
        clearInterval(this.runningRefreshInterval);
        this.runningRefreshInterval = null;
      }

      if (!newInterval || newInterval === -1) {
        // don't auto refresh
        return;
      }

      // setup a new interval
      var interval = setInterval(
        cb,
        newInterval);

      this.runningRefreshInterval = interval;
    };
  }
}
const refreshActions = alt.createActions<IRefreshActions>(RefreshActions);

export default refreshActions;
