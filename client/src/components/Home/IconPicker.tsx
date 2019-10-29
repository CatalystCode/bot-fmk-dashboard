import * as React from 'react';
import Autocomplete from 'react-md/lib/Autocompletes';
import FontIcon from 'react-md/lib/FontIcons';

import icons from '../../constants/icons';

interface IIconPickerProps {
  defaultLabel?: string;
  defaultIcon?: string;
  listStyle?: React.CSSProperties;
}

interface IIconPickerState {
  label: string;
  icon: string;
}

export default class IconPicker extends React.Component<IIconPickerProps, IIconPickerState> {

  static defaultProps = {
    defaultLabel: 'Search icons',
    defaultIcon: 'dashboard',
    listStyle: {},
  };

  static listItems: any = [];

  constructor(props: any) {
    super(props);

    const { defaultLabel, defaultIcon } = props;

    this.state = {
      label: defaultLabel,
      icon: defaultIcon,
    };

    this.onChange = this.onChange.bind(this);
  }

  getIcon() {
    const { icon } = this.state;
    // check icon value is valid
    if (icons.findIndex(i => i === icon) > 0) {
      return icon;
    }
    return 'dashboard';
  }

  componentWillMount() {
    if (IconPicker.listItems.length === 0) {
      IconPicker.listItems = icons.map((icon) => ({ icon, leftIcon: <FontIcon key="icon">{icon}</FontIcon> }));
    }
  }

  render() {
    const { label, icon } = this.state;
    const { listStyle } = this.props;
    return (
      <Autocomplete
        id="icon"
        label={label}
        className="md-cell--stretch"
        data={IconPicker.listItems}
        dataLabel={'icon'}
        listStyle={listStyle}
        value={icon}
        onChange={this.onChange}
        onAutocomplete={this.onChange}
      />
    );
  }

  private onChange(icon: string) {
    this.setState({ icon });
  }
}
