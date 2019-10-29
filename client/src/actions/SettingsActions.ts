import alt, { AbstractActions } from '../alt';

interface ISettingsActions {
  saveSettings(): any;
  saveSettingsCompleted(): any;
}

class SettingsActions extends AbstractActions implements ISettingsActions {

  saveSettings() {
    return {  };
  }

  saveSettingsCompleted() {
    return {  };
  }
}

const settingsActions = alt.createActions<ISettingsActions>(SettingsActions);

export default settingsActions;
