import * as React from 'react';
import * as _ from 'lodash';

import Toolbar from 'react-md/lib/Toolbars';
import Button from 'react-md/lib/Buttons';
import Dialog from 'react-md/lib/Dialogs';

import { Spinner } from '../Spinner';
import { AutoRefreshSelector } from '../AutoRefreshSelector';

import * as ReactGridLayout from 'react-grid-layout';
var ResponsiveReactGridLayout = ReactGridLayout.Responsive;
var WidthProvider = ReactGridLayout.WidthProvider;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

import ElementConnector from '../ElementConnector';
import { loadDialogsFromDashboard } from '../generic/Dialogs';
import { downloadBlob } from './DownloadFile';

import { SettingsButton } from '../Settings';
import ConfigurationsActions from '../../actions/ConfigurationsActions';
import ConfigurationsStore from '../../stores/ConfigurationsStore';
import VisibilityStore from '../../stores/VisibilityStore';

import { Editor, EditorActions } from './Editor';
import { Settings } from '../Card/Settings';

const renderHTML = require('react-render-html');

import List from 'react-md/lib/Lists/List';
import ListItem from 'react-md/lib/Lists/ListItem';
import FontIcon from 'react-md/lib/FontIcons';
import Avatar from 'react-md/lib/Avatars';
import Subheader from 'react-md/lib/Subheaders';
import Divider from 'react-md/lib/Dividers';
import TextField from 'react-md/lib/TextFields';
import MenuButton from 'react-md/lib/Menus/MenuButton';

interface IDashboardProps {
  dashboard?: IDashboardConfig;
}

interface IDashboardState {
  editMode?: boolean;
  askDelete?: boolean;
  askSaveAsTemplate?: boolean;
  mounted?: boolean;
  currentBreakpoint?: string;
  layouts?: ILayouts;
  grid?: any;
  askConfig?: boolean;
  visibilityFlags?: IDict<boolean>;
  infoVisible?: boolean;
  infoHtml?: string;
  newTemplateName?: string;
  newTemplateDescription?: string;
}

export default class Dashboard extends React.Component<IDashboardProps, IDashboardState> {

  layouts = {};

  state = {
    editMode: false,
    askDelete: false,
    askSaveAsTemplate: false,
    currentBreakpoint: 'lg',
    mounted: false,
    layouts: {},
    grid: null,
    askConfig: false,
    visibilityFlags: {},
    infoVisible: false,
    infoHtml: '',
    newTemplateName: '',
    newTemplateDescription: '',
  };

  constructor(props: IDashboardProps) {
    super(props);

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onLayoutChangeActive = this.onLayoutChangeActive.bind(this);
    this.onLayoutChangeInactive = this.onLayoutChangeInactive.bind(this);
    this.onConfigDashboard = this.onConfigDashboard.bind(this);
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.onDeleteDashboard = this.onDeleteDashboard.bind(this);
    this.onDeleteDashboardApprove = this.onDeleteDashboardApprove.bind(this);
    this.onDeleteDashboardCancel = this.onDeleteDashboardCancel.bind(this);
    this.onUpdateLayout = this.onUpdateLayout.bind(this);
    this.onOpenInfo = this.onOpenInfo.bind(this);
    this.onCloseInfo = this.onCloseInfo.bind(this);
    this.onDownloadDashboard = this.onDownloadDashboard.bind(this);
    this.onSaveAsTemplate = this.onSaveAsTemplate.bind(this);
    this.newTemplateNameChange = this.newTemplateNameChange.bind(this);
    this.onSaveAsTemplateApprove = this.onSaveAsTemplateApprove.bind(this);
    this.onSaveAsTemplateCancel = this.onSaveAsTemplateCancel.bind(this);
    this.newTemplateDescriptionChange = this.newTemplateDescriptionChange.bind(this);
    this.onVisibilityStoreChange = this.onVisibilityStoreChange.bind(this);

    VisibilityStore.listen(this.onVisibilityStoreChange);

    this.state.newTemplateName = this.props.dashboard.name;
    this.state.newTemplateDescription = this.props.dashboard.description;
  }

  componentDidMount() {
    let { dashboard } = this.props;
    let { mounted } = this.state;
    this.onLayoutChange = this.onLayoutChangeActive;

    if (dashboard && !mounted) {

      const layout = dashboard.config.layout;

      // For each column, create a layout according to number of columns
      let layouts = ElementConnector.loadLayoutFromDashboard(dashboard, dashboard);
      layouts = _.extend(layouts, dashboard.layouts || {});

      this.layouts = layouts;
      this.setState(state => ({
        ...state,
        mounted: true,
        layouts: { lg: layouts['lg'] },
        grid: {
          className: 'layout',
          rowHeight: layout.rowHeight || 30,
          cols: layout.cols,
          breakpoints: layout.breakpoints,
          verticalCompact: false
        }
      }));
    }
  }

  componentDidUpdate() {
    this.componentDidMount();
  }

  componentWillUnmount() {
    this.onLayoutChange = this.onLayoutChangeInactive;
    VisibilityStore.unlisten(this.onVisibilityStoreChange);    
  }

  onVisibilityStoreChange(state: any) {
    this.setState(state => ({ ...state, visibilityFlags: state.flags }));
  }

  onBreakpointChange(breakpoint: any) {
    var layouts = this.state.layouts;
    layouts[breakpoint] = layouts[breakpoint] || this.layouts[breakpoint];
    this.setState(state => ({
      ...state,
      currentBreakpoint: breakpoint,
      layouts: layouts
    }));
  }

  onLayoutChange(layout: any, layouts: any) { }

  onLayoutChangeActive(layout: any, layouts: any) {

    // Waiting for breakpoint to change
    let breakpoint = this.state.currentBreakpoint;
    let newLayouts = this.state.layouts;
    newLayouts[breakpoint] = layout;
    this.setState(state => ({
      ...state,
      layouts: newLayouts
    }));

    // Saving layout to API
    let { dashboard } = this.props;
    dashboard.layouts = dashboard.layouts || {};
    dashboard.layouts[breakpoint] = layout;

    if (this.state.editMode) {
      ConfigurationsActions.saveConfiguration(dashboard);
    }
  }

  onLayoutChangeInactive(layout: any, layouts: any) {
  }

  onConfigDashboard() {
    this.setState(state => ({ ...state, askConfig: true }));
  }

  toggleEditMode() {
    this.setState(state => ({ ...state, editMode: !this.state.editMode }));
  }

  onDeleteDashboard() {
    this.setState(state => ({ ...state, askDelete: true }));
  }

  onSaveAsTemplate() {
    this.setState(state => ({ ...state, askSaveAsTemplate: true }));
  }

  onSaveAsTemplateApprove() {
    let { dashboard } = this.props;
    var template = _.cloneDeep(dashboard);
    template.name = this.state.newTemplateName;
    template.description = this.state.newTemplateDescription;
    template.category = 'Custom Templates';
    template.id = template.url = dashboard.id + (Math.floor(Math.random() * 1000) + 1); // generate random id

    // Removing connections so private info will not be included
    template.config.connections = {};

    ConfigurationsActions.saveAsTemplate(template);
    window.location.href = '/';
    this.setState(state => ({ ...state, askSaveAsTemplate: false }));
  }

  onSaveAsTemplateCancel() {
    this.setState(state => ({ ...state, askSaveAsTemplate: false }));
  }

  newTemplateNameChange(value: string, e: any) {
    this.setState(state => ({ ...state, newTemplateName: value }));
  }

  newTemplateDescriptionChange(value: string, e: any) {
    this.setState(state => ({ ...state, newTemplateDescription: value }));
  }

  onDeleteDashboardApprove() {
    let { dashboard } = this.props;
    if (!dashboard) {
      console.warn('Dashboard not found. Aborting delete.');
    }
    ConfigurationsActions.deleteDashboard(dashboard.id);
    window.location.href = '/';
    this.setState(state => ({ ...state, askDelete: false }));
  }

  onDeleteDashboardCancel() {
    this.setState(state => ({ ...state, askDelete: false }));
  }

  onConfigDashboardCancel() {
    this.setState(state => ({ ...state, askConfig: false }));
  }
  
  onUpdateLayout() {
    this.setState(state => ({ ...state, editMode: !this.state.editMode }));
    this.setState(state => ({ ...state, editMode: !this.state.editMode }));
  }

  onOpenInfo(html: string) {
    this.setState(state => ({ ...state, infoVisible: true, infoHtml: html }));
  }

  onCloseInfo() {
    this.setState(state => ({ ...state, infoVisible: false }));
  }

  onDownloadDashboard() {
    let { dashboard } = this.props;
    dashboard.layouts = dashboard.layouts || {};
    let stringDashboard = ConfigurationsActions.convertDashboardToString(dashboard);
    var dashboardName = dashboard.id.replace(/  +/g, ' ');
    dashboardName = dashboard.id.replace(/  +/g, '_');
    downloadBlob('return ' + stringDashboard, 'application/json', dashboardName + '.private.js');
  }

  render() {
    const { dashboard } = this.props;

    const { 
      currentBreakpoint, 
      grid, 
      editMode, 
      askDelete,
      askConfig ,
      askSaveAsTemplate,
      newTemplateName,
      newTemplateDescription
    } = this.state;
    const { infoVisible, infoHtml } = this.state;
    const layout = this.state.layouts[currentBreakpoint];

    if (!grid) {
      return null;
    }

    // Creating visual elements
    var elements = ElementConnector.loadElementsFromDashboard(dashboard, layout);

    // Creating filter elements
    var { filters, /*additionalFilters*/ } = ElementConnector.loadFiltersFromDashboard(dashboard);

    // Loading dialogs
    var dialogs = loadDialogsFromDashboard(dashboard);

    // Actions to perform on an active dashboard
    let toolbarActions = [];

    // Edit toggle button
    const editLabel = editMode ? 'Save layout' : 'Edit layout' ;

    toolbarActions.push(
      (
        <span>
          <AutoRefreshSelector/>
        </span>
      ),
      (
        <span>
          <Button key="edit-grid" icon primary={editMode} tooltipLabel={editLabel} onClick={this.toggleEditMode}>
            edit
          </Button>
        </span>
      ),
      (
        <SettingsButton onUpdateLayout={this.onUpdateLayout} />
      ),
      (
        <span>
          <MenuButton 
            id="vert-menu"
            icon
            buttonChildren="more_vert"
            tooltipLabel="More">
            <ListItem 
              key="info" 
              primaryText="Info" 
              leftIcon={<FontIcon key="info">info</FontIcon>}
              onClick={this.onOpenInfo.bind(this, dashboard.html)} 
            />
            <Divider />
            <ListItem 
              key="edit" 
              primaryText="Edit code" 
              leftIcon={<FontIcon key="code">code</FontIcon>}
              onClick={() => EditorActions.loadDashboard(dashboard.id)} 
            />
            <ListItem 
              key="down" 
              primaryText="Download dashboard" 
              leftIcon={<FontIcon key="file_download">file_download</FontIcon>}
              onClick={this.onDownloadDashboard} 
            />
            <ListItem 
              key="temp" 
              primaryText="Save as template" 
              leftIcon={<FontIcon key="cloud_download">cloud_download</FontIcon>}
              onClick={this.onSaveAsTemplate} 
            />
            <Divider />
            <ListItem 
              key="del" 
              primaryText="Delete dashboard" 
              leftIcon={<FontIcon key="delete">delete</FontIcon>}
              onClick={this.onDeleteDashboard} 
            />
          </MenuButton>
        </span>
      )
    );

    return (
      <div style={{width: '100%'}}>
        <Toolbar width={100} actions={toolbarActions}>
          {filters}
          <Spinner />
        </Toolbar>
        <ResponsiveReactGridLayout
          {...grid}

          isDraggable={editMode}
          isResizable={editMode}

          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          // WidthProvider option
          measureBeforeMount={false}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          useCSSTransforms={this.state.mounted}
        >
          {elements}
        </ResponsiveReactGridLayout>

        {dialogs}

        <Dialog
          id="infoDialog"
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

        <Editor dashboard={dashboard} />

        <Settings dashboard={dashboard} />

        <Dialog
          id="deleteDashboard"
          visible={askDelete}
          title="Are you sure?"
          aria-labelledby="deleteDashboardDescription"
          modal
          actions={[
            { onClick: this.onDeleteDashboardApprove, primary: false, label: 'Permanently Delete', },
            { onClick: this.onDeleteDashboardCancel, primary: true, label: 'Cancel' }
          ]}
        >
          <p id="deleteDashboardDescription" className="md-color--secondary-text">
            Deleting this dashboard will remove all Connections/Customization you have made to it.
            Are you sure you want to permanently delete this dashboard?
          </p>
        </Dialog>

        <Dialog
          dialogStyle={{ width: '50%' }}
          id="saveAsTemplateDialog"
          visible={askSaveAsTemplate}
          title="Save this dashoard as a custom template"
          modal
          actions={[
            { onClick: this.onSaveAsTemplateApprove, primary: false, label: 'Save as custom template', },
            { onClick: this.onSaveAsTemplateCancel, primary: true, label: 'Cancel' }
          ]}
        >
          <p>You can save this dashboard as a custom template for a future reuse</p>
          <TextField
            id="templateName"
            label="New Template Name"
            placeholder="Template Name"
            className="md-cell md-cell--bottom"
            value={newTemplateName}
            onChange={this.newTemplateNameChange}
            required
          />
          <TextField
            id="templateDescription"
            label="New Template Description"
            placeholder="Template Description"
            className="md-cell md-cell--bottom"
            value={newTemplateDescription}
            onChange={this.newTemplateDescriptionChange}
            required
          />
        </Dialog>
      </div>
    );
  }
}
