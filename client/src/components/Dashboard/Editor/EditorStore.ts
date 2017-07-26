import * as React from 'react';
import alt, { AbstractStoreModel } from '../../../alt';

import editorActions from './EditorActions';

interface IEditorStoreState {
  visible: boolean;
  value: string;
  selectedTheme: number;
  // internal
  saveDisabled: boolean;
}

class EditorStore extends AbstractStoreModel<IEditorStoreState> implements IEditorStoreState {

  visible: boolean;
  value: string;
  selectedTheme: number;
  // internal
  saveDisabled: boolean;

  constructor() {
    super();

    this.visible = false;
    this.value = null;
    this.selectedTheme = 0;

    this.saveDisabled = false;

    this.bindListeners({
      openDialog: editorActions.openDialog,
      closeDialog: editorActions.closeDialog,
      loadDashboard: editorActions.loadDashboard,
      selectTheme: editorActions.selectTheme,
      updateValue: editorActions.updateValue,
    });
  }
  
  openDialog() {
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
  }

  loadDashboard(value: string) {
    this.value = value;
  }

  selectTheme(index: number) {
    this.selectedTheme = index;
  }

  updateValue(newValue: string) {
    this.value = newValue;
  }
}

const editorStore = alt.createStore<IEditorStoreState>(EditorStore, 'EditorStore');

export default editorStore;
