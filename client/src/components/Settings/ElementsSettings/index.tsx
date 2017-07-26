import * as React from 'react';
import * as _ from 'lodash';
import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

import ElementSettingsFactory from './ElementSettingsFactory';

interface IElementsSettingsProps {
  settings: IElementsContainer;
}

interface IElementsSettingsState { 
  selectedIndex: number;
}

export default class ElementsSettings extends React.Component<IElementsSettingsProps, IElementsSettingsState> {

  state = {
    selectedIndex: 0
  };
    
  constructor(props: IElementsSettingsProps) {
    super(props);

    this.onMenuClick = this.onMenuClick.bind(this);
  }
  
  onMenuClick(index: number) {
    this.setState({ selectedIndex: index });
  }

  render() {

    let menuItems = () => {
      let { selectedIndex } = this.state;
      let items = this.props.settings.elements.map((item, idx) => (
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

    let getSettingsEditor = () => {
    
      // Create settings element
      let selectedSettings = 
        this.props.settings.elements.length > this.state.selectedIndex ?
        this.props.settings.elements[this.state.selectedIndex] : 
        null;
      if (!selectedSettings) {
        return <h1>No elements were found</h1>;
      }

      let editor = ElementSettingsFactory.getSettingsEditor(selectedSettings);
      if (editor) { return editor; }

      return <h1>No settings yet for {selectedSettings.type}</h1>;
    };

    return (
      <div className="md-grid md-cell md-cell--12">
        {menuItems()}
        <div className="md-cell md-cell--top md-cell--stretch md-cell--10">
          {getSettingsEditor()}
        </div>
      </div>
    );
  }
}