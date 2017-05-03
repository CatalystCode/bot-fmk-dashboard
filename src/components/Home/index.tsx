import * as React from 'react';
import Button from 'react-md/lib/Buttons/Button';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import { Card, CardTitle, CardActions, CardText } from 'react-md/lib/Cards';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import Dialog from 'react-md/lib/Dialogs';
import TextField from 'react-md/lib/TextFields';
import { Link } from 'react-router';
import { IDashboardConfig, ISetupConfig } from '../../types';

import InfoDrawer from '../common/InfoDrawer';

import SetupActions from '../../actions/SetupActions';
import SetupStore from '../../stores/SetupStore';

import ConfigurationActions from '../../actions/ConfigurationsActions';
import ConfigurationStore from '../../stores/ConfigurationsStore';

interface IHomeState extends ISetupConfig {
  loaded?: boolean;
  templates?: IDashboardConfig[];
  selectedTemplateId?: string;
  template?: IDashboardConfig;
  creationState?: string;
}

export default class Home extends React.Component<any, IHomeState> {

  state: IHomeState = {
    admins: null,
    stage: 'none',
    enableAuthentication: false,
    allowHttp: false,
    redirectUrl: '',
    clientID: '',
    clientSecret: '',
    loaded: false,

    templates: [],
    selectedTemplateId: null,
    template: null,
    creationState: null  
  };

  constructor(props: any) {
    super(props);

    this.onNewTemplateSelected = this.onNewTemplateSelected.bind(this);
    this.onNewTemplateCancel = this.onNewTemplateCancel.bind(this);
    this.onNewTemplateSave = this.onNewTemplateSave.bind(this);

    // Setting the state from the configuration store
    let state = ConfigurationStore.getState() || {} as any;
    let { templates, template, creationState } = state;
    this.state.templates = templates || [];
    this.state.template = template;
    this.state.creationState = creationState;

    ConfigurationStore.listen(state => {
      this.setState({ 
        templates: state.templates || [] ,
        template: state.template,
        creationState: state.creationState
      })
    })
  }

  componentDidMount() {

    this.setState(SetupStore.getState());

    SetupActions.load();
    SetupStore.listen(state => {
      this.setState(state);
      
      // Setup hasn't been configured yet
      if (state.stage === 'none') {
        window.location.replace('/setup');
      }
    });
  }

  componentDidUpdate() {
    if (this.state.creationState === 'successful') {
      window.location.replace('/dashboard/' + (this.refs.id as any).getField().value)
    }
  }

  onNewTemplateSelected(templateId) {
    this.setState({ selectedTemplateId: templateId });
    ConfigurationActions.loadTemplate(templateId);
  }

  onNewTemplateCancel() {
    this.setState({ selectedTemplateId: null });
  }

  deepObjectExtend (target: any, source: any) {
    for (var prop in source)
      if (prop in target)
        this.deepObjectExtend(target[prop], source[prop]);
      else
        target[prop] = source[prop];
    return target;
  }

  onNewTemplateSave() {

    let createParams = {
      id: (this.refs.id as any).getField().value,
      name: (this.refs.name as any).getField().value,
      icon: (this.refs.icon as any).getField().value,
      url: (this.refs.id as any).getField().value
    };

    var dashboard: IDashboardConfig = this.deepObjectExtend({}, this.state.template);
    dashboard.id = createParams.id;
    dashboard.name = createParams.name;
    dashboard.icon = createParams.icon;
    dashboard.url = createParams.url;

    ConfigurationActions.createDashboard(dashboard);
  }

  render() {

    let { loaded, redirectUrl, templates, selectedTemplateId, template } = this.state;

    if (!redirectUrl) {
      redirectUrl = window.location.protocol + '//' + window.location.host + '/auth/openid/return';
    }

    if (!loaded) {
      return <CircularProgress key="progress" id="contentLoadingProgress" />;
    }

    let templateCards = templates.map((template, index) => (
      <div style={{ maxWidth: 450, maxHeight: 216, margin: 10 }} className="md-cell--6" key={index}>
        <Card style={{ marginTop: 40 }}>
          <Media>
            <img src={template.preview} role="presentation" style={{ filter: 'opacity(30%)' }}/>
            <MediaOverlay>
              <CardTitle title={template.name} subtitle={template.description} wrapperStyle={{ whiteSpace: 'wrap' }}>
                <Button onClick={this.onNewTemplateSelected.bind(this, template.id)} className="md-cell--right" icon>add_circle_outline</Button>
              </CardTitle>
            </MediaOverlay>
          </Media>
        </Card>
      </div>
    ))

    return (
      <div style={{ width: '100%' }} className="md-grid">
        {templateCards}

        <Dialog
          id="configNewDashboard"
          visible={selectedTemplateId !== null && template !== null}
          title="Configure the new dashboard"
          aria-labelledby="configNewDashboardDescription"
          dialogStyle={{ width: '50%' }}
          modal
          actions={[
            { onClick: this.onNewTemplateSave, primary: false, label: 'Create', },
            { onClick: this.onNewTemplateCancel, primary: true, label: 'Cancel' }
          ]}
        >
          <TextField
            id="id"
            ref="id"
            label="Dashboard Id"
            defaultValue={template && template.id || ''}
            lineDirection="center"
            placeholder="Choose an ID for the dashboard (will be used in the url)"
          />
          <TextField
            id="name"
            ref="name"
            label="Dashboard Name"
            defaultValue={template && template.name || ''}
            lineDirection="center"
            placeholder="Choose name for the dashboard (will be used in navigation)"
          />
          <TextField
            id="icon"
            ref="icon"
            label="Dashboard Icon"
            defaultValue={template && template.icon || 'dashboard'}
            lineDirection="center"
            placeholder="Choose icon for the dashboard (will be used in navigation)"
          />
        </Dialog>
      </div>
    );
  }
}
