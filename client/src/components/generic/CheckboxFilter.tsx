import * as React from 'react';
import { GenericComponent } from './GenericComponent';
import Checkbox from 'react-md/lib/SelectionControls/Checkbox';

const style = {
  checkbox: {
    float: 'left',
    paddingTop: '24px'
  }
};

export default class CheckboxFilter extends GenericComponent<any, any> {

  state = {
    values: [],
    selectedValues: []
  };

  constructor(props: any) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue: string, checked: boolean, event: React.ChangeEvent<string>) {
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

    this.trigger('onChange', newSelectedValues);
  }

  render() {
    var { title } = this.props;
    var { selectedValues, values } = this.state;
    values = values || [];

    let checkboxes = values.map((value, idx) => {
      return (
        <Checkbox
          key={idx}
          id={idx}
          name={value}
          label={value}
          onChange={this.onChange.bind(null, value)}
          style={style.checkbox}
          checked={selectedValues.find((x) => x === value) !== undefined}
        />
      );
    });

    return (
      <div id="filters">
        <div style={style.checkbox}><label>{title}</label></div>
        {checkboxes}
      </div>
    );
  }
}