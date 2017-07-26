import * as React from 'react';
import Button from 'react-md/lib/Buttons/Button';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import { Card, CardTitle, CardActions, CardText } from 'react-md/lib/Cards';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import Dialog from 'react-md/lib/Dialogs';
import TextField from 'react-md/lib/TextFields';
import FileUpload from 'react-md/lib/FileInputs/FileUpload';
import { Link } from 'react-router';

import SetupActions from '../../actions/SetupActions';
import SetupStore from '../../stores/SetupStore';

import ConfigurationStore from '../../stores/ConfigurationsStore';
import ConfigurationsActions from '../../actions/ConfigurationsActions';

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
  importVisible?: boolean;
  importedFileContent?: any;
  fileName?: string;
  content?: string;
  infoTitle?: string;
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
    infoTitle: ''
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

    // import dashboard functionality
    this.onOpenImport = this.onOpenImport.bind(this);
    this.onCloseImport = this.onCloseImport.bind(this);
    this.onSubmitImport = this.onSubmitImport.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.setFile = this.setFile.bind(this);
    this.updateFileName = this.updateFileName.bind(this);
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
    ConfigurationsActions.loadTemplate(templateId);
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

    ConfigurationsActions.createDashboard(dashboard);
  }

  onOpenInfo(html: string, title: string) {
    this.setState({ infoVisible: true, infoHtml: html, infoTitle: title });
  }

  onCloseInfo() {
    this.setState({ infoVisible: false });
  }

  onOpenImport() {
    this.setState({ importVisible: true });
  }

  onCloseImport() {
    this.setState({ importVisible: false });
  }

  updateFileName(value: string) {
    this.setState({ fileName: value });
  };

  onLoad(importedFileContent: any, uploadResult: string) {
    const { name, size, type, lastModifiedDate } = importedFileContent;
    this.setState({ fileName: name.substr(0, name.indexOf('.')), content: uploadResult });
  }

  onSubmitImport() {
    var dashboardId = this.state.fileName;
    ConfigurationsActions.submitDashboardFile(this.state.content, dashboardId);
    
    this.setState({ importVisible: false });
  }

  setFile(importedFileContent: string) {
    this.setState({ importedFileContent });
  }

  render() {
    let { loaded, redirectUrl, templates, selectedTemplateId, template } = this.state;
    let { importVisible } = this.state;
    let { importedFileContent, fileName } = this.state;
    let { infoVisible, infoHtml, infoTitle } = this.state;

    if (!redirectUrl) {
      redirectUrl = window.location.protocol + '//' + window.location.host + '/auth/openid/return';
    }

    if (!loaded) {
      return <CircularProgress key="progress" id="contentLoadingProgress" />;
    }

    if (!templates) {
      return null;
    }

    let createCard = (tmpl, index) => (
      <div key={index} className="md-cell" style={styles.card}>
        <Card 
          className="md-block-centered" 
          key={index} 
          style={{ backgroundImage: `url(${tmpl.preview})`}} >
          <Media>
            <MediaOverlay>
              <CardTitle title={tmpl.name} subtitle={tmpl.description} />
            </MediaOverlay>
          </Media>
          <CardActions style={styles.fabs}>
            <Button 
              floating 
              secondary 
              onClick={this.onOpenInfo.bind(this, tmpl.html || '<p>No info available</p>', tmpl.name)}
            >
              info
            </Button>
            <Button 
              floating 
              primary 
              onClick={this.onNewTemplateSelected.bind(this, tmpl.id)} style={styles.primaryFab}
            >
              add_circle_outline
            </Button>
          </CardActions>
        </Card>
      </div>
    );

    // Dividing templates into categories
    let categories = { 'General': [] };
    templates.forEach((tmpl, index) => {
      let category = tmpl.category || 'General';
      categories[category] = categories[category] || [];
      categories[category].push(createCard(tmpl, index));
    });

    return (
      <div>
        <div style={{ textAlign: 'right' }}>
          <Button
            flat
            tooltipLabel="Import dashboard"
            onClick={this.onOpenImport.bind(this)}
            label="Import dashboard"
          >file_upload
          </Button>
          <Dialog
            id="ImportDashboard"
            visible={importVisible || false}
            title="Import dashboard"
            modal
            actions={[
              { onClick: this.onCloseImport, primary: false, label: 'Cancel' },
              { onClick: this.onSubmitImport, primary: true, label: 'Submit', disabled: !importedFileContent },
            ]}>
            <FileUpload
              id="dashboardDefenitionFile"
              primary
              label="Choose File"
              accept="application/javascript"
              onLoadStart={this.setFile}
              onLoad={this.onLoad}
            />
            <TextField
              id="dashboardFileName"
              label="Dashboard ID"
              value={fileName || ''}
              onChange={this.updateFileName}
              disabled={!importedFileContent}
              lineDirection="center"
              placeholder="Choose an ID for the imported dashboard"
            />
          </Dialog>
        </div>

        {
          Object.keys(categories).map((category, index) => {
            if (!categories[category].length) { return null; }
            return (
              <div key={index}>
                <h1>{category}</h1>
                <div className="md-grid">
                  {categories[category]}
                </div>
              </div>
            );
          })
        }

        <Dialog
          id="templateInfoDialog"
          title={infoTitle}
          visible={infoVisible || false}
          onHide={this.onCloseInfo}
          dialogStyle={{ width: '80%' }}
          contentStyle={{ padding: '0', maxHeight: 'calc(100vh - 148px)' }}
          aria-label="Info"
          focusOnMount={false}
        >
          <div className="md-grid" style={{ padding: 20 }}>
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
