import alt, { AbstractStoreModel } from '../../../alt';

import dialogsActions from './DialogsActions';

interface IDialogsStoreState {
  dialogsStack: { dialogName: string, args: any }[];
  dialogId: string;
  dialogArgs: any;
}

class DialogsStore extends AbstractStoreModel<IDialogsStoreState> implements IDialogsStoreState {

  dialogsStack: { dialogName: string, args: any }[];
  dialogId: string;
  dialogArgs: any;

  constructor() {
    super();

    this.dialogsStack = [];
    this.dialogId = null;
    this.dialogArgs = null;

    this.bindListeners({
      openDialog: dialogsActions.openDialog,
      closeDialog: dialogsActions.closeDialog
    });
  }
  
  openDialog(params: { dialogName: string, args: any }) {
    this.dialogsStack.push(params);
    this.dialogId = params.dialogName;
    this.dialogArgs = params.args;
  }

  closeDialog() {
    this.dialogsStack.pop();
    var dialog = this.dialogsStack.length > 0 ? 
        this.dialogsStack[this.dialogsStack.length - 1] : 
        { dialogName: null, args: null };
    this.dialogId = dialog.dialogName;
    this.dialogArgs = dialog.args;
  }
}

const dialogsStore = alt.createStore<IDialogsStoreState>(DialogsStore, 'DialogsStore');

export default dialogsStore;
