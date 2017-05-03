import * as React from 'react';
import * as _ from 'lodash';

import Toolbar from 'react-md/lib/Toolbars';
import Button from 'react-md/lib/Buttons';
import Dialog from 'react-md/lib/Dialogs';
import { Spinner } from '../Spinner';
import { IDashboardConfig, IDict, ILayouts } from '../../types';

import * as ReactGridLayout from 'react-grid-layout';
var ResponsiveReactGridLayout = ReactGridLayout.Responsive;
var WidthProvider = ReactGridLayout.WidthProvider;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

import ElementConnector from '../ElementConnector';
import { loadDialogsFromDashboard } from '../generic/Dialogs';

import ConfigurationsActions from '../../actions/ConfigurationsActions';
import ConfigurationsStore from '../../stores/ConfigurationsStore';
import VisibilityStore from '../../stores/VisibilityStore';

interface IDashboardState {
  editMode?: boolean,
  askDelete?: boolean,
  mounted?: boolean;
  currentBreakpoint?: string;
  layouts?: ILayouts;
  grid?: any;
  visibilityFlags?: IDict<boolean>;
}

interface IDashboardProps {
  dashboard?: IDashboardConfig;
}

export default class Dashboard extends React.Component<IDashboardProps, IDashboardState> {

  layouts = {};
  
  state = {
    editMode: false,
    askDelete: false,
    currentBreakpoint: 'lg',
    mounted: false,
    layouts: { },
    grid: null,
    visibilityFlags: {}
  };

  constructor(props: IDashboardProps) {
    super(props);

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onEditDashboard = this.onEditDashboard.bind(this);
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.onDeleteDashboard = this.onDeleteDashboard.bind(this);
    this.onDeleteDashboardApprove = this.onDeleteDashboardApprove.bind(this);
    this.onDeleteDashboardCancel = this.onDeleteDashboardCancel.bind(this);

    VisibilityStore.listen(state => {
      this.setState({ visibilityFlags: state.flags });
    })
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

  onBreakpointChange(breakpoint) {
    var layouts = this.state.layouts;
    layouts[breakpoint] = layouts[breakpoint] || this.layouts[breakpoint];
    this.setState({
      currentBreakpoint: breakpoint,
      layouts: layouts
    });
  }

  onLayoutChange(layout, layouts) {

    // Waiting for breakpoint to change
    let currentBreakpoint = this.state.currentBreakpoint;
    setTimeout(() => {

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
    }, 500);
      
  }

  onEditDashboard() {
    window.location.replace('/dashboard/config');
  }

  toggleEditMode() {
    this.setState({ editMode: !this.state.editMode });
  }

  onDeleteDashboard() {
    this.setState({ askDelete: true });
  }

  onDeleteDashboardApprove() {
    this.setState({ askDelete: false });
  }

  onDeleteDashboardCancel() {
    this.setState({ askDelete: false });
  }

  render() {

    let { dashboard } = this.props;
    var { currentBreakpoint, grid, editMode, askDelete } = this.state;
    var layout = this.state.layouts[currentBreakpoint];

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
      <Button key="edit" icon primary={editMode} tooltipLabel="Edit Dashboard" onClick={this.toggleEditMode}>edit</Button>,
      <Button key="settings" icon tooltipLabel="Connections" onClick={this.onEditDashboard}>settings_applications</Button>
    ];

    if (editMode) {
      toolbarActions.push(
        <Button key="delete" icon tooltipLabel="Delete dashboard" onClick={this.onDeleteDashboard}>delete</Button>
      );
    }

    return (
      <div style={{ width: '100%' }}>
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
          id="speedBoost"
          visible={askDelete}
          title="Use Google's location service?"
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
