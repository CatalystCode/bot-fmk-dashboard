import alt, { AbstractActions } from '../../../alt';

interface IDialogsActions {
  openDialog(dialogName: string, args: { [id: string]: Object }): any;
  closeDialog(): any;
}

class DialogsActions extends AbstractActions implements IDialogsActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  openDialog(dialogName: string, args: { [id: string]: Object }) {
    return { dialogName, args };
  }

  closeDialog() {
    return {};
  }
}

const dialogsActions = alt.createActions<IDialogsActions>(DialogsActions);

export default dialogsActions;
