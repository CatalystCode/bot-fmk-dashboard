import * as React from 'react';
import * as _ from 'lodash';

import Toolbar from 'react-md/lib/Toolbars';
import Button from 'react-md/lib/Buttons';
import Dialog from 'react-md/lib/Dialogs';

import { Spinner } from '../Spinner';

import * as ReactGridLayout from 'react-grid-layout';
var ResponsiveReactGridLayout = ReactGridLayout.Responsive;
var WidthProvider = ReactGridLayout.WidthProvider;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

import ElementConnector from '../ElementConnector';
import { loadDialogsFromDashboard } from '../generic/Dialogs';
import IDownloadFile, { exportDataSources, createDownloadFiles, downloadBlob } from './DownloadFile';

import { SettingsButton } from '../Settings';
import ConfigurationsActions from '../../actions/ConfigurationsActions';
import ConfigurationsStore from '../../stores/ConfigurationsStore';
import VisibilityStore from '../../stores/VisibilityStore';

const renderHTML = require('react-render-html');

import List from 'react-md/lib/Lists/List';
import ListItem from 'react-md/lib/Lists/ListItem';
import SelectField from 'react-md/lib/SelectFields';
import FontIcon from 'react-md/lib/FontIcons';
import Avatar from 'react-md/lib/Avatars';
import Subheader from 'react-md/lib/Subheaders';
import Divider from 'react-md/lib/Dividers';

interface IDashboardProps {
  dashboard?: IDashboardConfig;
}

interface IDashboardState {
  editMode?: boolean;
  askDelete?: boolean;
  askDownload?: boolean;
  downloadFiles?: IDownloadFile[];
  downloadFormat?: string;
  mounted?: boolean;
  currentBreakpoint?: string;
  layouts?: ILayouts;
  grid?: any;
  askConfig?: boolean;
  visibilityFlags?: IDict<boolean>;
  infoVisible?: boolean;
  infoHtml?: string;
}

export default class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
 
  layouts = {};

  state = {
    editMode: false,
    askDelete: false,
    askDownload: false,
    downloadFiles: [],
    downloadFormat: 'json',
    currentBreakpoint: 'lg',
    mounted: false,
    layouts: {},
    grid: null,
    askConfig: false,
    visibilityFlags: {},
    infoVisible: false,
    infoHtml: '',
  };

  constructor(props: IDashboardProps) {
    super(props);

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onConfigDashboard = this.onConfigDashboard.bind(this);
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.onDeleteDashboard = this.onDeleteDashboard.bind(this);
    this.onDeleteDashboardApprove = this.onDeleteDashboardApprove.bind(this);
    this.onDeleteDashboardCancel = this.onDeleteDashboardCancel.bind(this);
    this.onUpdateLayout = this.onUpdateLayout.bind(this);
    this.onOpenInfo = this.onOpenInfo.bind(this);
    this.onCloseInfo = this.onCloseInfo.bind(this);
    this.onExport = this.onExport.bind(this);
    this.onCloseExport = this.onCloseExport.bind(this);
    this.onClickDownloadFile = this.onClickDownloadFile.bind(this);
    this.onChangeDownloadFormat = this.onChangeDownloadFormat.bind(this);
    VisibilityStore.listen(state => {
      this.setState({ visibilityFlags: state.flags });
    });
  }

  componentDidMount() {
    let { dashboard } = this.props;
    let { mounted } = this.state;

    if (dashboard && !mounted) {

      const layout = dashboard.config.layout;

      // For each column, create a layout according to number of columns
      let layouts = ElementConnector.loadLayoutFromDashboard(dashboard, dashboard);
      layouts = _.extend(layouts, dashboard.config.layout.layouts || {});

      this.layouts = layouts;
      this.setState({
        mounted: true,
        layouts: { lg: layouts['lg'] },
        grid: {
          className: 'layout',
          rowHeight: layout.rowHeight || 30,
          cols: layout.cols,
          breakpoints: layout.breakpoints,
          verticalCompact: false
        }
      });
    }
  }

  componentDidUpdate() {
    this.componentDidMount();
  }

  onBreakpointChange(breakpoint: any) {
    var layouts = this.state.layouts;
    layouts[breakpoint] = layouts[breakpoint] || this.layouts[breakpoint];
    this.setState({
      currentBreakpoint: breakpoint,
      layouts: layouts
    });
  }

  onLayoutChange(layout: any, layouts: any) {

    // Waiting for breakpoint to change
    let currentBreakpoint = this.state.currentBreakpoint;
    setTimeout(
      () => {
        if (currentBreakpoint !== this.state.currentBreakpoint) { return; }

        var breakpoint = this.state.currentBreakpoint;
        var newLayouts = this.state.layouts;
        newLayouts[breakpoint] = layout;
        this.setState({
          layouts: newLayouts
        });

        // Saving layout to API
        let { dashboard } = this.props;
        dashboard.config.layout.layouts = dashboard.config.layout.layouts || {};
        dashboard.config.layout.layouts[breakpoint] = layout;

        if (this.state.editMode) {
          ConfigurationsActions.saveConfiguration(dashboard);
        }
      },
      500);
  }

  onConfigDashboard() {
    this.setState({ askConfig: true });
  }

  toggleEditMode() {
    this.setState({ editMode: !this.state.editMode });
  }

  onDeleteDashboard() {
    this.setState({ askDelete: true });
  }

  onDeleteDashboardApprove() {
    let { dashboard } = this.props;
    if (!dashboard) {
      console.warn('Dashboard not found. Aborting delete.');
    }
    ConfigurationsActions.deleteDashboard(dashboard.id);
    window.location.href = '/';
    this.setState({ askDelete: false });
  }

  onDeleteDashboardCancel() {
    this.setState({ askDelete: false });
  }

  onConfigDashboardCancel() {
    this.setState({ askConfig: false });
  }
  
  onUpdateLayout() {
    this.setState({ editMode: !this.state.editMode });
    this.setState({ editMode: !this.state.editMode });
  }
  onOpenInfo(html: string) {
    this.setState({ infoVisible: true, infoHtml: html });
  }

  onCloseInfo() {
    this.setState({ infoVisible: false });
  }

  onExport() {
    const data = exportDataSources();
    let downloadFiles: IDownloadFile[] = createDownloadFiles(data);
    downloadFiles.sort((a, b) => {
      return a.source === b.source ? a.filename > b.filename ? 1 : -1 : a.source > b.source ? 1 : -1 ;
    });
    this.setState({ askDownload: true, downloadFiles: downloadFiles });
  }

  onCloseExport(event: any) {
    this.setState({ askDownload: false });
  }

  onClickDownloadFile(file: IDownloadFile, event: any) {
    const { downloadFormat } = this.state;
    if (downloadFormat === 'json') {
      downloadBlob(file.json, 'application/json', file.filename + '.json');
    } else {
      downloadBlob(file.csv, 'text/csv', file.filename + '.csv');
    }
  }

  onChangeDownloadFormat(value: string, event: any) {
    this.setState({ downloadFormat: value });
  }

  render() {

    let { dashboard } = this.props;
    let { 
      currentBreakpoint, 
      grid, 
      editMode, 
      askDelete,
      askDownload, 
      downloadFiles, 
      downloadFormat, 
      askConfig 
    } = this.state;
    let { infoVisible, infoHtml } = this.state;
    let layout = this.state.layouts[currentBreakpoint];

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
    let toolbarActions = [
      (
       <span><Button key="export" icon tooltipLabel="Export data" onClick={this.onExport}>
        play_for_work
      </Button></span>
      ), 
      (
      <span><Button key="info" icon tooltipLabel="Info" onClick={this.onOpenInfo.bind(this, dashboard.html)}>
        info
      </Button></span>
      ), (
      <span><Button key="edit" icon primary={editMode} tooltipLabel="Edit Dashboard" onClick={this.toggleEditMode}>
        edit
      </Button></span>
      ), (
      <SettingsButton onUpdateLayout={this.onUpdateLayout}/>
      )
    ];

    if (editMode) {
      toolbarActions.push(
        <span>
          <Button key="delete" icon tooltipLabel="Delete dashboard" onClick={this.onDeleteDashboard}>delete</Button>
        </span>
      );
    }
    
    const fileAvatar = (downloadFormat === 'json') ? 
      <Avatar suffix="red" icon={<FontIcon>insert_drive_file</FontIcon>} /> 
      : <Avatar suffix="green" icon={<FontIcon>description</FontIcon>} /> ;

    let downloadItems = [];
    let prevSection = '';
    if (!_.isEmpty(downloadFiles)) {
      Object.keys(downloadFiles).forEach((key, index) => {
        const item: IDownloadFile = downloadFiles[key];
        if ( prevSection !== item.source ) {
          if (prevSection !== '') {
            downloadItems.push(<Divider key={item.source + '_' + index} className="md-cell md-cell--12" />);
          }
          downloadItems.push(
            <Subheader primaryText={item.source} key={item.source + index} className="md-cell md-cell--12" />);
        }
        downloadItems.push(
          <ListItem
            key={item.filename + index}
            leftAvatar={fileAvatar}
            rightIcon={<FontIcon>file_download</FontIcon>}
            primaryText={item.filename}
            secondaryText={'.' + downloadFormat}
            onClick={this.onClickDownloadFile.bind(this, item)}
            className="md-cell md-cell--3"
          />
        );
        prevSection = item.source;
      });
    }

    return (
      <div style={{width: '100%'}}>
        <Toolbar actions={toolbarActions}>
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
        
        <Dialog
          id="downloadData"
          title={(
            <Toolbar
              title="Export Data"
              fixed
              style={{ width: '100%' }}
              actions={(
                <SelectField
                  id="selectExportFormat"
                  placeholder="File format"
                  position={SelectField.Positions.BELOW}
                  menuItems={['json', 'csv']}
                  defaultValue={downloadFormat}
                  onChange={this.onChangeDownloadFormat.bind(this)}
                />
              )}
            />
          )}
          visible={askDownload}
          focusOnMount={false}
          onHide={this.onCloseExport}
          dialogStyle={{ width: '80%' }}
          contentStyle={{ marginTop: '20px' }}
        >
          <List className="md-grid" style={{ maxHeight: 400 }}>
            {downloadItems}
          </List>
        </Dialog>

        <Dialog
          id="speedBoost"
          visible={askDelete}
          title="Are you sure?"
          aria-labelledby="speedBoostDescription"
          modal
          actions={[
            { onClick: this.onDeleteDashboardApprove, primary: false, label: 'Permanently Delete', },
            { onClick: this.onDeleteDashboardCancel, primary: true, label: 'Cancel' }
          ]}
        >
          <p id="speedBoostDescription" className="md-color--secondary-text">
            Deleting this dashboard will remove all Connections/Customization you have made to it.
            Are you sure you want to permanently delete this dashboard?
          </p>
        </Dialog>
      </div>
    );
  }
}
