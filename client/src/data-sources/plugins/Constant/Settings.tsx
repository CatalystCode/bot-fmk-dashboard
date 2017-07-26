import * as React from 'react';
import * as _ from 'lodash';

import Chip from 'react-md/lib/Chips';
import FontIcon from 'react-md/lib/FontIcons';
import Paper from 'react-md/lib/Papers';
import Divider from 'react-md/lib/Dividers';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import SelectField from 'react-md/lib/SelectFields';

import TokenInput from '../../../components/common/TokenInput';

import { BaseDataSourceSettings, IBaseSettingsProps, IBaseSettingsState } 
                from '../../../components/common/BaseDatasourceSettings';

export default class ConstantDatasourceSettings extends BaseDataSourceSettings<IBaseSettingsState> {

  icon = 'chrome_reader_mode';
  state = {
    keyIndex: 0,
    selectedToken: ''
  };

  constructor(props: IBaseSettingsProps) {
    super(props);
    this.selectedTokenChange = this.selectedTokenChange.bind(this);
    this.onTokensChanged = this.onTokensChanged.bind(this);
    this.state.keyIndex = 0;
    this.state.selectedToken = this.props.settings.params['selectedValue'];
  }

  selectedTokenChange(newValue: any) {
    this.setState({ selectedToken: newValue });
    if (this.props.settings && this.props.settings.params) {
      this.props.settings.params['selectedValue'] = newValue;
    }
  }

  onTokensChanged() {
    var tokens = this.props.settings.params['values'];
    var selected = this.state.selectedToken;

    if (!_.find(tokens, x => x === selected)) {
      // the selected value was removed, thus, we set it to default
      if (tokens.lenght > 0) {
        this.setState({ selectedToken: tokens[0] });
      } else {
        this.setState({ selectedToken: '' });
      }
    }
  }

  renderChildren() {
    let { selectedToken } = this.state;
    let tokens = this.props.settings.params['values'];
    return (
      <span className="md-cell md-cell--bottom  md-cell--12">
        <div className="md-grid">
          <span className="md-cell--3 md-cell--middle">
            <span className="md-caption" style={{padding: 5}}>values:</span>
          </span>
          <span className="md-cell--9 md-cell--bottom">
          <TokenInput tokens={tokens} zDepth={0} onTokensChanged={this.onTokensChanged} />
        </span>
        </div>
        <div className="md-grid">
          <span className="md-cell--3 md-cell--middle">
            <span className="md-caption" style={{padding: 5}}>selected value:</span>
          </span>
          <span className="md-cell--9 md-cell--bottom">
            <SelectField
              id="selectedValue"
              value={selectedToken}
              menuItems={tokens}
              className="md-cell"
              onChange={this.selectedTokenChange}
            />
          </span>
        </div>
      </span>
    );
  }
}