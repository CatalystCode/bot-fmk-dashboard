import * as React from 'react';
import Toolbar from 'react-md/lib/Toolbars';
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
import utils from '../../utils';

import IconPicker from './IconPicker';
import { downloadBlob } from '../Dashboard/DownloadFile';

const renderHTML = require('react-render-html');

const MultipleSpacesRegex = /  +/g;
const styles = {
  card: {
    width: 380,
    height: 280,
    marginBottom: 20
  } as React.CSSProperties,
  media: {
    width: 380,
    height: 150,
    background: '#CCC',
    margin: 0,
    padding: 0
  } as React.CSSProperties,
  preview: {
    width: 380,
    height: 150,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50% 50%',
    backgroundSize: 'contain'
  } as React.CSSProperties,
  actions: {
    position: 'absolute',
    bottom: 0
  } as React.CSSProperties
};

interface IHomeState extends ISetupConfig {
  loaded?: boolean;
  errors?: any;
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
    errors: null,

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
    this.onExportTemplate = this.onExportTemplate.bind(this);
    this.downloadTemplate = this.downloadTemplate.bind(this);
    this.onOpenImport = this.onOpenImport.bind(this);
  }

  updateConfiguration(state: {
    templates: IDashboardConfig[],
    template: IDashboardConfig,
    creationState: string,
    errors: any
  }) {
    this.setState({
      templates: state.templates || [],
      template: state.template,
      creationState: state.creationState,
      errors: state.errors,
    });
    if (this.state.stage === 'requestDownloadTemplate') {
      this.downloadTemplate(this.state.template);
    }
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
      icon: this._fieldIcon.getIcon(),
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
  }

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

  onExportTemplate(templateId: string) {
    this.setState({ stage: 'requestDownloadTemplate' });
    ConfigurationsActions.loadTemplate(templateId);
  }

  downloadTemplate(template: IDashboardConfig) {
    template.layouts = template.layouts || {};
    let stringDashboard = utils.convertDashboardToString(template);
    var dashboardName = template.id.replace(MultipleSpacesRegex, ' ');
    dashboardName = template.id.replace(MultipleSpacesRegex, '_');
    downloadBlob('return ' + stringDashboard, 'application/json', dashboardName + '.private.ts');
  }

  render() {
    let { errors, loaded, redirectUrl, templates, selectedTemplateId, template } = this.state;
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

    // Create dashboard form validation
    let error = false;
    let errorText = null;
    if (errors && errors.error && errors.type && errors.type === 'id') {
      errorText = errors.error;
      error = true;
    }

    let createCard = (tmpl, index) => (
      <Card
        key={index}
        className="templates md-cell"
        style={styles.card}>
        <Media style={styles.media}>
          <div className="preview" style={{ ...styles.preview, backgroundImage: `url(${tmpl.preview})` }} />
        </Media>
        <CardTitle title={tmpl.name} subtitle={tmpl.description} />
        <CardActions style={styles.actions}>
          <Button
            label="Download"
            tooltipLabel="Download template"
            flat
            onClick={this.onExportTemplate.bind(this, tmpl.id)}
          >
            file_download
          </Button>
          <Button
            label="Info"
            tooltipLabel="Show info"
            flat
            onClick={this.onOpenInfo.bind(this, tmpl.html || '<p>No info available</p>', tmpl.name)}
          >
            info
          </Button>
          <Button
            label="Create"
            tooltipLabel="Create dashboard"
            flat
            primary
            onClick={this.onNewTemplateSelected.bind(this, tmpl.id)}
          >
            add_circle_outline
          </Button>
        </CardActions>
      </Card>
    );

    // Dividing templates into categories
    // General - All dashboards without any categories
    // Features - Dashboards appearing at the top of the creation screen
    let categories = { 'General': [], 'Featured': [] };
    templates.forEach((tmpl, index) => {
      let category = tmpl.category || 'General';
      
      if (tmpl.featured) {
        categories['Featured'].push(createCard(tmpl, index));
      }
      categories[category] = categories[category] || [];
      categories[category].push(createCard(tmpl, index));
    });

    // Sort templates alphabetically 
    let sortedCategories = { 'General':  categories.General, 'Featured': categories.Featured };
    const keys = Object.keys(categories).filter(category => category !== 'Featured').sort(); 
    keys.forEach(key => sortedCategories[key] = categories[key]);
    categories = sortedCategories;

    let toolbarActions = [];
    toolbarActions.push(
      (
        <Button
          flat
          tooltipLabel="Import dashboard"
          onClick={this.onOpenImport}
          label="Import dashboard"
        >file_upload
        </Button>
      )
    );

    return (
      <div className="md-cell md-cell--12">
        <Toolbar actions={toolbarActions} />
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
          <IconPicker 
            ref={field => this._fieldIcon = field}
            defaultLabel="Dashboard Icon" 
            defaultIcon={template && template.icon || 'dashboard'}
            listStyle={{height: '136px'}} />
          <TextField
            id="id"
            ref={field => this._fieldId = field}
            label="Dashboard Id"
            defaultValue={template && template.id || ''}
            lineDirection="center"
            placeholder="Choose an ID for the dashboard (will be used in the url)"
            error={error}
            errorText={errorText}
          />
          <TextField
            id="name"
            ref={field => this._fieldName = field}
            label="Dashboard Name"
            defaultValue={template && template.name || ''}
            lineDirection="center"
            placeholder="Choose name for the dashboard (will be used in navigation)"
          />
        </Dialog>
      </div>
    );
  }
}
