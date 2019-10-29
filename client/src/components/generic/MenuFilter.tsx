import * as React from 'react';
import { GenericComponent } from './GenericComponent';
import Button from 'react-md/lib/Buttons';
import Portal from 'react-md/lib/Helpers/Portal';
import AccessibleFakeButton from 'react-md/lib/Helpers/AccessibleFakeButton';
import AccessibleFakeInkedButton from 'react-md/lib/Helpers/AccessibleFakeInkedButton';
import List from 'react-md/lib/Lists/List';
import ListItemControl from 'react-md/lib/Lists/ListItemControl';
import Checkbox from 'react-md/lib/SelectionControls/Checkbox';
import ListItem from 'react-md/lib/Lists/ListItem';
import FontIcon from 'react-md/lib/FontIcons';
import './generic.css';

const styles = {
  button: {
    userSelect: 'none',
  } as React.CSSProperties,
  container: {
    position: 'relative',
    float: 'left',
    zIndex: 17,
  } as React.CSSProperties,
  animateOpen: {
    transition: '.3s',
    transform: 'scale(1.0,1.0)',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,
  animateClose: {
    transform: 'scale(1.0,0)',
    transition: '0s',
  } as React.CSSProperties,
  list: {
    position: 'absolute',
    top: '0px',
    left: '0px',
  } as React.CSSProperties
};

// using styles from the select field menu
const classNames = {
  menu: ['md-inline-block', 'md-menu-container', 'md-menu-container--menu-below', 'md-select-field-menu',
    'md-select-field-menu--stretch', 'md-select-field--toolbar', ''],
  label: ['md-floating-label', 'md-floating-label--floating', ''],
};

export default class MenuFilter extends GenericComponent<any, any> {

  static defaultProps = {
    title: '',
    subtitle: 'Select filter',
    icon: 'more_vert',
    selectAll: 'Enable filters',
    selectNone: 'Clear filters'
  };

  static fromSource(source: string) {
    return {
      selectedValues: GenericComponent.sourceFormat(source, 'values-selected'), 
      values: GenericComponent.sourceFormat(source, 'values-all')
    };
  }

  constructor(props: any) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);
    this.hideOverlay = this.hideOverlay.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.selectNone = this.selectNone.bind(this);

    this.state = {
      overlay: false,
      values: [],
      selectedValues: [],
      originalSelectedValues: []
    };
  }

  toggleOverlay() {
    const { overlay, selectedValues } = this.state;
    this.setState({ overlay: !overlay, originalSelectedValues: selectedValues });
    if (overlay) {
      this.triggerChanges();
    }
  }

  hideOverlay() {
    this.setState({ overlay: false });
    this.triggerChanges();
  }

  triggerChanges() {
    const { selectedValues } = this.state;
    if (!this.didSelectionChange()) {
      return;
    }
    this.trigger('onChange', selectedValues);
  }

  didSelectionChange(): boolean {
    const { selectedValues, originalSelectedValues } = this.state;
    if (!selectedValues || !originalSelectedValues) {
      return false;
    }
    if (selectedValues.length !== originalSelectedValues.length
      || selectedValues.slice(0).sort().join() !== originalSelectedValues.slice(0).sort().join()) {
      return true;
    }
    return false;
  }

  onChange(newValue: any, checked: boolean, event: any) {
    var { selectedValues } = this.state;
    let newSelectedValues = selectedValues.slice(0);
    const idx = selectedValues.findIndex((x) => x === newValue);
    if (idx === -1 && checked) {
      newSelectedValues.push(newValue);
    } else if (idx > -1 && !checked) {
      newSelectedValues.splice(idx, 1);
    } else {
      console.warn('Unexpected checked filter state:', newValue, checked);
    }
    this.setState({ selectedValues: newSelectedValues });
  }

  selectAll() {
    this.setState({ selectedValues: this.state.values });
  }

  selectNone() {
    this.setState({ selectedValues: [] });
  }

  render() {
    const { title, subtitle, icon } = this.props;
    let { selectedValues, values, overlay } = this.state;
    values = values || [];
    selectedValues = selectedValues || [];
    let listItems = values.map((value, idx) => {
      return (
        <ListItemControl
          key={idx + title}
          primaryAction={(
            <Checkbox
              id={idx + value}
              name={value}
              label={value}
              onChange={this.onChange.bind(null, value)}
              checked={selectedValues.find((x) => x === value) !== undefined}
            />
          )}
        />
      );
    });

    if (values.length > 1) {
      const selectAll = this.props.selectAll;
      const selectNone = this.props.selectNone;
      const iconAll = <FontIcon>done_all</FontIcon>;
      const iconNone = <FontIcon disabled>check_box_outline_blank</FontIcon>;
      listItems.push(<ListItem key="all" primaryText={selectAll} onClick={this.selectAll} rightIcon={iconAll} />);
      listItems.push(<ListItem key="none" primaryText={selectNone} onClick={this.selectNone} rightIcon={iconNone} />);
    }

    const paperStyle = overlay ? classNames.menu.join(' ') + 'md-paper md-paper--1' : classNames.menu.join(' ');
    const labelStyle = overlay ? classNames.label.join(' ') + 'md-floating-label--active' : classNames.label.join(' ');

    const containerStyle = overlay ? { ...styles.container, ...styles.animateOpen }
      : { ...styles.container, ...styles.animateClose };

    let selectText = subtitle || 'Select';
    if (selectedValues === undefined) {
      selectText = subtitle || 'Select';
    } else if (selectedValues.length === 1) {
      selectText = selectedValues[0];
    } else if (selectedValues.length > 1) {
      selectText = `${selectedValues.length} selected`;
    }

    return (
      <div className="filters">

        <AccessibleFakeInkedButton
          className={paperStyle}
          onClick={this.toggleOverlay}
          aria-haspopup="true"
          aria-expanded={overlay}
          style={styles.button}
        >
          <label className={labelStyle}>{title}</label>
          <div className="md-icon-separator md-text-field md-select-field--btn md-text-field--floating-margin">
            <span className="md-value md-icon-text">{selectText}</span>
            <FontIcon>arrow_drop_down</FontIcon>
          </div>
        </AccessibleFakeInkedButton>

        <div className="md-multiselect-menu" style={containerStyle}>
          <List className="md-paper md-paper--1" style={styles.list}>
            {listItems}
          </List>
        </div>

        <Portal visible={overlay}>
          <AccessibleFakeButton
            className="md-overlay"
            onClick={this.hideOverlay}
          />
        </Portal>

      </div>
    );
  }

}
