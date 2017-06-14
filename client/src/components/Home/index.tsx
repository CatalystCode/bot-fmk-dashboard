import * as React from 'react';
import Button from 'react-md/lib/Buttons/Button';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import { Card, CardTitle, CardActions, CardText } from 'react-md/lib/Cards';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import Dialog from 'react-md/lib/Dialogs';
import TextField from 'react-md/lib/TextFields';

import SetupActions from '../../actions/SetupActions';
import SetupStore from '../../stores/SetupStore';

import ConfigurationActions from '../../actions/ConfigurationsActions';
import ConfigurationStore from '../../stores/ConfigurationsStore';

const renderHTML = require('react-render-html');

const styles = {
  card: {
    minWidth: 400,
    height: 200,
    marginTop: 50,
  },
  image: {
    filter: 'opacity(30%) grayscale(70%)'
  },
  fabs: {
    position: 'absolute',
    bottom: '50px',
    right: '10px',
    zIndex: 1,
  },
  primaryFab: {
    marginLeft: '2px'
  }
};

interface IHomeState extends ISetupConfig {
  loaded?: boolean;
  templates?: IDashboardConfig[];
  selectedTemplateId?: string;
  template?: IDashboardConfig;
  creationState?: string;
  infoVisible?: boolean;
  infoHtml?: string;
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
    issuer: '',
    loaded: false,

    templates: [],
    selectedTemplateId: null,
    template: null,
    creationState: null,

    infoVisible: false,
    infoHtml: '',
  };

  private _fieldId;
  private _fieldName;
  private _fieldIcon;

  constructor(props: any) {
    super(props);

    this.onNewTemplateSelected = this.onNewTemplateSelected.bind(this);
    this.onNewTemplateCancel = this.onNewTemplateCancel.bind(this);
    this.onNewTemplateSave = this.onNewTemplateSave.bind(this);

    this.onOpenInfo = this.onOpenInfo.bind(this);
    this.onCloseInfo = this.onCloseInfo.bind(this);
    this.updateSetup = this.updateSetup.bind(this);
    this.updateConfiguration = this.updateConfiguration.bind(this);
  }

  updateConfiguration(state: {templates: IDashboardConfig[], template: IDashboardConfig, creationState: string}) {
    this.setState({
      templates: state.templates || [],
      template: state.template,
      creationState: state.creationState
    });
  }

  updateSetup(state: IHomeState) {
    this.setState(state);

    // Setup hasn't been configured yet
    if (state.stage === 'none') {
      window.location.replace('/setup');
    }
  }

  componentDidMount() {

    this.setState(SetupStore.getState());
    this.updateConfiguration(ConfigurationStore.getState());

    SetupActions.load();
    SetupStore.listen(this.updateSetup);
    ConfigurationStore.listen(this.updateConfiguration);
  }

  componentWillUnmount() {
    SetupStore.unlisten(this.updateSetup);
    ConfigurationStore.unlisten(this.updateConfiguration);
  }

  componentDidUpdate() {
    if (this.state.creationState === 'successful') {
      window.location.replace('/dashboard/' + this._fieldId.getField().value);
    }
  }

  onNewTemplateSelected(templateId: string) {
    this.setState({ selectedTemplateId: templateId });
    ConfigurationActions.loadTemplate(templateId);
  }

  onNewTemplateCancel() {
    this.setState({ selectedTemplateId: null });
  }

  deepObjectExtend(target: any, source: any) {
    for (var prop in source) {
      if (prop in target) {
        this.deepObjectExtend(target[prop], source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  }

  onNewTemplateSave() {

    let createParams = {
      id: this._fieldId.getField().value,
      name: this._fieldName.getField().value,
      icon: this._fieldIcon.getField().value,
      url: this._fieldId.getField().value
    };

    var dashboard: IDashboardConfig = this.deepObjectExtend({}, this.state.template);
    dashboard.id = createParams.id;
    dashboard.name = createParams.name;
    dashboard.icon = createParams.icon;
    dashboard.url = createParams.url;

    ConfigurationActions.createDashboard(dashboard);
  }

  onOpenInfo(html: string) {
    this.setState({ infoVisible: true, infoHtml: html });
  }

  onCloseInfo() {
    this.setState({ infoVisible: false });
  }

  render() {
    let { loaded, redirectUrl, templates, selectedTemplateId, template } = this.state;
    let { infoVisible, infoHtml } = this.state;

    if (!redirectUrl) {
      redirectUrl = window.location.protocol + '//' + window.location.host + '/auth/openid/return';
    }

    if (!loaded) {
      return <CircularProgress key="progress" id="contentLoadingProgress" />;
    }

    if (!templates) {
      return null;
    }

    let templateCards = templates.map((temp, index) => (
      <div key={index} className="md-cell" style={styles.card}>
        <Card className="md-block-centered" key={index} >
          <Media>
            <img src={temp.preview} role="presentation" style={styles.image} />
            <MediaOverlay>
              <CardTitle title={temp.name} subtitle={temp.description} />
            </MediaOverlay>
          </Media>
          <CardActions style={styles.fabs}>
            <Button floating secondary onClick={this.onOpenInfo.bind(this, temp.html || '<p>No info available</p>')}>
              info
            </Button>
            <Button floating primary onClick={this.onNewTemplateSelected.bind(this, temp.id)} style={styles.primaryFab}>
              add_circle_outline
            </Button>
          </CardActions>
        </Card>
      </div>
    ));

    return (
      <div>
        <div className="md-grid">
          {templateCards}
        </div>

        <Dialog
          id="templateInfoDialog"
          visible={infoVisible}
          onHide={this.onCloseInfo}
          dialogStyle={{ width: '80%' }}
          contentStyle={{ padding: '0', maxHeight: 'calc(100vh - 148px)' }}
          aria-label="Info"
          focusOnMount={false}
        >
          <div className="md-grid">
            {renderHTML(infoHtml)}
          </div>
        </Dialog>

        <Dialog
          id="configNewDashboard"
          visible={selectedTemplateId !== null && template !== null}
          title="Configure the new dashboard"
          aria-labelledby="configNewDashboardDescription"
          dialogStyle={{ width: '50%' }}
          modal
          actions={[
            { onClick: this.onNewTemplateCancel, primary: false, label: 'Cancel' },
            { onClick: this.onNewTemplateSave, primary: true, label: 'Create', },
          ]}
        >
          <TextField
            id="id"
            ref={field => this._fieldId = field}
            label="Dashboard Id"
            defaultValue={template && template.id || ''}
            lineDirection="center"
            placeholder="Choose an ID for the dashboard (will be used in the url)"
          />
          <TextField
            id="name"
            ref={field => this._fieldName = field}
            label="Dashboard Name"
            defaultValue={template && template.name || ''}
            lineDirection="center"
            placeholder="Choose name for the dashboard (will be used in navigation)"
          />
          <TextField
            id="icon"
            ref={field => this._fieldIcon = field}
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
