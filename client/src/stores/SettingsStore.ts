import alt, { AbstractStoreModel } from '../alt';

import settingsActions from '../actions/SettingsActions';

export interface ISettingsStoreState {
  isSavingSettings: boolean;
}

class SettingsStore extends AbstractStoreModel<ISettingsStoreState> implements ISettingsStoreState {

  isSavingSettings: boolean;

  constructor() {
    super();

    this.bindListeners({
      saveSettings: settingsActions.saveSettings,
      saveSettingsCompleted: settingsActions.saveSettingsCompleted
    });
  }
  
  saveSettings() {
    this.isSavingSettings = true;
  }
  saveSettingsCompleted() {
    this.isSavingSettings = false;
  }
}

const settingsStore = alt.createStore<ISettingsStoreState>(SettingsStore, 'SettingsStore');

export default settingsStore;
