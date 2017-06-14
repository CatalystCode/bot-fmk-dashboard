import * as React from 'react';
import { GenericComponent } from './GenericComponent';
import SelectField from 'react-md/lib/SelectFields';

export default class TextFilter extends GenericComponent<any, any> {

  static defaultProps = {
    title: 'Select'
  };

  constructor(props: any) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue: any) {
    this.trigger('onChange', newValue);
  }

  render() {
    var { selectedValue, values } = this.state;
    var { title } = this.props;
    values = values || [];

    return (
        <SelectField
          id="timespan"
          label={title}
          value={selectedValue}
          menuItems={values}
          position={SelectField.Positions.BELOW}
          onChange={this.onChange}
          toolbar={false}
          className="md-select-field--toolbar"
        />
    );
  }
}