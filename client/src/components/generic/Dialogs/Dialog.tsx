import * as React from 'react';

import { DataSourceConnector, IDataSourceDictionary } from '../../../data-sources';
import ElementConnector from  '../../ElementConnector';

import DialogsActions from './DialogsActions';
import DialogsStore from './DialogsStore';

import MDDialog from 'react-md/lib/Dialogs';
import Button from 'react-md/lib/Buttons/Button';
import List from 'react-md/lib/Lists/List';
import ListItem from 'react-md/lib/Lists/ListItem';

import * as ReactGridLayout from 'react-grid-layout';
var ResponsiveReactGridLayout = ReactGridLayout.Responsive;
var WidthProvider = ReactGridLayout.WidthProvider;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

interface IDialogProps {
  dialogData: IDialog;
  dashboard: IDashboardConfig;
}

interface IDialogState {
  dialogId?: string;
  dialogArgs?: IDictionary;
  mounted?: boolean;
  currentBreakpoint?: string;
  layouts?: ILayouts;
}

export default class Dialog extends React.PureComponent<IDialogProps, IDialogState> {

  layouts = {};

  constructor(props: IDialogProps) {
    super(props);

    this.state = DialogsStore.getState();
    this.onChange = this.onChange.bind(this);

    // Create dialog data source
    var dialogDS: IDataSource = {
      id: 'dialog_' + this.props.dialogData.id,
      type: 'Constant',
      params: {
        selectedValue: null
      }
    };
    DataSourceConnector.createDataSources({ dataSources: [ dialogDS ] }, this.props.dashboard.config.connections);

    // Adding other data sources
    DataSourceConnector.createDataSources(this.props.dialogData, this.props.dashboard.config.connections);

    var layouts = ElementConnector.loadLayoutFromDashboard(this.props.dialogData, this.props.dashboard);
    
    this.layouts = layouts;
    (this.state as any).layouts = {  };
  }

  componentDidMount() {
    this.setState({ mounted: true });
    DialogsStore.listen(this.onChange);
  }

  componentDidUpdate() {
    const { dialogData } = this.props;
    var { dialogId, dialogArgs } = this.state;
    
    if (dialogData.id === dialogId) {
      let dataSourceId = 'dialog_' + dialogData.id;
      let dataSource = DataSourceConnector.getDataSource(dataSourceId);
      dataSource.action.updateDependencies.defer(dialogArgs);
    }
  }

  onBreakpointChange = (breakpoint) => {
    var layouts = this.state.layouts;
    layouts[breakpoint] = layouts[breakpoint] || this.layouts[breakpoint];
    this.setState({
      currentBreakpoint: breakpoint,
      layouts: layouts
    });
  }

  onChange(state: IDialogState) {
    var { dialogId, dialogArgs } = state;
    this.setState({ dialogId, dialogArgs });
  }

  closeDialog = () => {
    DialogsActions.closeDialog();
  }

  render() {
    const { dialogData, dashboard } = this.props;
    const { id } = dialogData;
    const { dialogId, dialogArgs } = this.state;
    let { title } = dialogArgs || { title: '' };
    if (title === undefined) {
      title = '';
    }
    var visible = id === dialogId;

    if (!visible) {
      return null;
    }

    var { currentBreakpoint } = this.state;
    var layout = null;
    
    if (!currentBreakpoint || !this.state.layouts[currentBreakpoint]) {
      layout = this.layouts[currentBreakpoint || 'lg'];
    } else {
      layout = this.state.layouts[currentBreakpoint];
    }

    // Creating visual elements
    var elements = ElementConnector.loadElementsFromDashboard(dialogData, layout);

    let grid = {
      className: 'layout',
      rowHeight: dashboard.config.layout.rowHeight || 30,
      cols: dashboard.config.layout.cols,
      breakpoints: dashboard.config.layout.breakpoints
    };

    return (
      <MDDialog
        id={id}
        visible={visible}
        title={title}
        focusOnMount={false}
        onHide={this.closeDialog}
        dialogStyle={{ width: dialogData.width || '80%', overflow: 'auto' }}
        contentStyle={{ padding: '0' }}
      >
        <ResponsiveReactGridLayout
          {...grid}

          isDraggable={false}
          isResizable={false}

          layouts={this.layouts}
          onBreakpointChange={this.onBreakpointChange}
          // WidthProvider option
          measureBeforeMount={false}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          useCSSTransforms={this.state.mounted}
        >
          {elements}
        </ResponsiveReactGridLayout>
      </MDDialog>
    );
  }
}