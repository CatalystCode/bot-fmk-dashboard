import * as React from 'react';
import * as _ from 'lodash';

import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

import plugins from '../../../data-sources/plugins';

interface IDataSourceSettingsProps {
  settings: IDataSourceContainer;
}

interface IDataSourceSettingsState { 
  selectedIndex: number;
}

/// This class displays a UI to edit the different data sources of the config file.
export default class DataSourceSettings extends React.Component<IDataSourceSettingsProps, IDataSourceSettingsState> {

  static uniqueId = 0;

  state = {
    selectedIndex: 0
  };
    
  constructor(props: IDataSourceSettingsProps) {
    super(props);

    this.onMenuClick = this.onMenuClick.bind(this);
    this.getSettings = this.getSettings.bind(this);
    this.getSettingsEditor = this.getSettingsEditor.bind(this);
  }
  
  /**
   * Each element is expected to expose a static 'editor' property, which is the UI editor for this specific 
   * data source node.
   */
  getSettingsEditor(element: DataSource): JSX.Element {

    if (!element) { return null; }

    let ReactElementClass = plugins[element.type];
    if (ReactElementClass && ReactElementClass.editor) {
      let SettingsEditor = ReactElementClass.editor;
      return <SettingsEditor key={DataSourceSettings.uniqueId++} settings={element} />;
    }
    return null;
  }

  onMenuClick(index: number) {
    this.setState({ selectedIndex: index });
  }

  /**
   * Get the selected settings from the provided array of settings, based on the user selection.
   */
  getSettings(): IDataSource {
    if (this.props && this.props.settings && this.props.settings.dataSources) {
      return this.props.settings.dataSources.length > this.state.selectedIndex ?
        this.props.settings.dataSources[this.state.selectedIndex] :
        null;
    }
    return null;
  }
  
  render() {

    let renderSettingsEditor = (): JSX.Element => {
      let selectedSettings = this.getSettings();
      if (!selectedSettings) {
        return <h1>No data-sources were found</h1>;
      }

      let editor = this.getSettingsEditor(selectedSettings);
      if (editor) { return editor; }

      return <h1>No settings yet for {selectedSettings.type}</h1>;
    };

    let renderMenuItems = (): JSX.Element => {
      let { selectedIndex } = this.state;
      let items = this.props.settings.dataSources.map((item, idx) => (
        <ListItem
          key={idx}
          primaryText={item.id}
          onClick={this.onMenuClick.bind(this, idx)}
          className={selectedIndex === idx ? 'active-item' : ''}
          active={selectedIndex === idx}
        />
      ));

      return (
        <List className="md-cell md-paper md-paper--1 md-cell--top md-cell--left md-cell--2 vertical-menu">
          {items}
        </List>
      );
    };

    return (
      <div className="md-grid md-cell md-cell--12">
        {renderMenuItems()}
        <div className="md-cell md-cell--top md-cell--stretch md-cell--10">
          {renderSettingsEditor()}
        </div>
      </div>
    );
  }
}