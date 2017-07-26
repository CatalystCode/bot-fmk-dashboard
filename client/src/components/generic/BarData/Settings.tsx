import * as React from 'react';

import FontIcon from 'react-md/lib/FontIcons';
import TextField from 'react-md/lib/TextFields';

import  {BaseSettings, IBaseSettingsProps, IBaseSettingsState } from '../../common/BaseSettings';

export default class BarDataSettings extends BaseSettings<IBaseSettingsState> {
    
  icon = 'insert_chart';
  
  renderChildren() {
    let { settings } = this.props;
    let { props } = settings;
    
    return (
      <TextField
        id="props.nameKey"
        label="nameKey"
        placeholder="nameKey"
        leftIcon={<FontIcon>text_fields</FontIcon>}
        className="md-cell md-cell--bottom  md-cell--6"
        value={props.nameKey}
        onChange={this.onParamChange}
      />
    );
  }
}