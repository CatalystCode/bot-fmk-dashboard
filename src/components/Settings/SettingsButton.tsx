import * as React from 'react';
import * as _ from 'lodash';

import Button from 'react-md/lib/Buttons/Button';
import Toolbar from 'react-md/lib/Toolbars';
import Dialog from 'react-md/lib/Dialogs';
import Paper from 'react-md/lib/Papers';
import SelectField from 'react-md/lib/SelectFields';
import { TabsContainer, Tabs, Tab } from 'react-md/lib/Tabs';
import FontIcon from 'react-md/lib/FontIcons';

import { ToastActions } from '../Toast';

import ConnectionsSettings from './ConnectionsSettings';
import ElementsSettings from './ElementsSettings';
import SettingsStore, { ISettingsStoreState } from '../../stores/SettingsStore';
import SettingsActions from '../../actions/SettingsActions';
import ConfigurationsActions from '../../actions/ConfigurationsActions';
import ConfigurationsStore, { IConfigurationsStoreState } from '../../stores/ConfigurationsStore';

interface ISettingsButtonState {
  showSettingsDialog?: boolean;
  activeView?: string;
  isSaveInProgress?: boolean;
  dashboard?: IDashboardConfig;
}

interface ISettingsButtonProps {
  children?: any;
  onUpdateLayout: any;
}

const VIEWS = {
  Connections: 'Connections',
  Elements: 'Elements',
  DataSources: 'Data Sources',
  Filters: 'Filters'
};

export default class SettingsButton extends React.Component<ISettingsButtonProps, ISettingsButtonState> {

  state: ISettingsButtonState = {
    showSettingsDialog: false,
    activeView: VIEWS.Connections,
    dashboard: null
  };

  constructor(props: ISettingsButtonProps) {
    super(props);

    this.onSettingsButtonClicked = this.onSettingsButtonClicked.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSettingsStoreChange = this.onSettingsStoreChange.bind(this);
    this.onConfigurationChange = this.onConfigurationChange.bind(this);
    this.onSelectView = this.onSelectView.bind(this);
  }

  componentDidMount() {
    SettingsStore.listen(this.onSettingsStoreChange);

    this.onConfigurationChange(ConfigurationsStore.getState());
    ConfigurationsStore.listen(this.onConfigurationChange);
  }
  
  componentWillUnmount() {
    SettingsStore.unlisten(this.onSettingsStoreChange);
    ConfigurationsStore.unlisten(this.onConfigurationChange);
  }

  onConfigurationChange(state: IConfigurationsStoreState) {

    // Only update the state if the dashboard was not set already
    if (!this.state.dashboard) {
      let { dashboard } = state;
      
      // Clone the dashboard to enable canceling changes
      let clonedDashboard = _.cloneDeep(dashboard);
      
      this.setState({ dashboard: clonedDashboard });
    }

    if (this.state.isSaveInProgress) {
      this.setState({ 
        isSaveInProgress: false,
        showSettingsDialog: false
      });

      window.location.reload();
    }
  }

  onSettingsStoreChange(state: ISettingsStoreState) {

  }

  onSettingsButtonClicked() {
    this.setState({ showSettingsDialog: true });
  }

  onSave() {
    let { dashboard } = this.state;

    this.setState({ isSaveInProgress: true });
    ConfigurationsActions.saveConfiguration(dashboard);
  }

  onCancel() {
    this.setState({ showSettingsDialog: false });
  }

  onSelectView(viewName: string) {
    this.setState({ activeView: viewName });
  }

  render() {
    let { dashboard, showSettingsDialog } = this.state;

    if (!dashboard) { return null; }

    if (!dashboard.config || !dashboard.config.connections) {
      ToastActions.showText('Dashboard configuration is invalid');
      return null;
    }
    
    const titleMenu = (
      <SelectField
        key="titleMenu"
        id="titles"
        menuItems={[ VIEWS.Connections, VIEWS.DataSources, VIEWS.Elements , VIEWS.Filters ]}
        defaultValue={VIEWS.Connections}
        onChange={this.onSelectView}
      />
    );

    return (
      <span>
        <Button key="settings" icon tooltipLabel="Connections" onClick={this.onSettingsButtonClicked}>
          settings_applications
        </Button>
        <Dialog
          id="settingsForm"
          title="Edit Dashboard Settings"
          visible={showSettingsDialog}
          dialogStyle={{ width: '90%', height: '90%', overflowY: 'auto' }}
          className="dialog-toolbar-no-padding"
          modal
          actions={[
            { onClick: this.onSave, primary: true, label: 'Save', },
            { onClick: this.onCancel, primary: false, label: 'Cancel' }
          ]}
        >
          <TabsContainer colored panelClassName="md-grid">
            <Tabs tabId="settings-tabs">
              <Tab label={VIEWS.Connections}>
                <div className="md-cell md-cell--6">
                  <ConnectionsSettings connections={dashboard.config.connections} />          
                </div>
              </Tab>
              <Tab label={VIEWS.Elements}>
                <ElementsSettings settings={dashboard} />
              </Tab>
              <Tab label={VIEWS.DataSources}>
                <h1>{VIEWS.DataSources} - is not implemented yet</h1>
              </Tab>
              <Tab label={VIEWS.Filters}>
                <h1>{VIEWS.Filters} - is not implemented yet</h1>
              </Tab>
            </Tabs>
          </TabsContainer>
        </Dialog>  
      </span>
    );
  }
}