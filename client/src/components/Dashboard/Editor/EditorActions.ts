import alt, { AbstractActions } from '../../../alt';
import * as request from 'xhr-request';

interface IEditorActions {
  openDialog(): any;
  closeDialog(): any;
  loadDashboard(dashboardId: string): any;
  selectTheme(index: number): number;
  updateValue(newValue: string): string;
}

class EditorActions extends AbstractActions implements IEditorActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  openDialog() {
    return {};
  }

  closeDialog() {
    return {};
  }

  loadDashboard(dashboardId: string) {
    this.openDialog();
    return (dispatch) => {
      request('/api/dashboards/' + dashboardId + '?format=raw', {}, function (err: any, data: any) {
        if (err) {
          throw err;
        }
        return dispatch( data );
      });
    };
  }

  selectTheme(index: number) {
    return index;
  }

  updateValue(newValue: string): string {
    return newValue;
  }

}

const editorActions = alt.createActions<IEditorActions>(EditorActions);

export default editorActions;
