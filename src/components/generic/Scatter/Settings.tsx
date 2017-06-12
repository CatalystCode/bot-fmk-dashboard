import * as React from 'react';
import * as _ from 'lodash';

import FontIcon from 'react-md/lib/FontIcons';
import TextField from 'react-md/lib/TextFields';
import SelectField from 'react-md/lib/SelectFields';

import { BaseSettings, IBaseSettingsProps, IBaseSettingsState } from '../../common/BaseSettings';
import ArrayInput from '../../common/ArrayInput';
import { ToastActions } from '../../Toast';

export default class ScatterSettings extends BaseSettings<IBaseSettingsState> {

  icon = 'bubble_chart';

  constructor(props: IBaseSettingsProps) {
    super(props);

    this.onRangeParamChange = this.onRangeParamChange.bind(this);
  }
  
  onRangeParamChange(value: string, event: any) {

    try {
      let { settings } = this.props;
      let idx = _.toNumber(_.replace(event.target.id, 'props.zRange.', ''));
      settings.props.zRange[idx] = _.toNumber(value);

    } catch (e) {
      ToastActions.showText('onRangeParamChange failed to update value. ' + e);
    }
  }

  renderChildren() {
    let { settings } = this.props;
    let { id, dependencies, actions, props, title, subtitle, size, theme, type } = settings;

    return (
      <span className="md-cell md-cell--bottom  md-cell--12 md-grid">
        <TextField
          id="props.xDataKey"
          label="xDataKey"
          placeholder="xDataKey"
          leftIcon={<FontIcon>tune</FontIcon>}
          className="md-cell md-cell--bottom  md-cell--6"
          defaultValue={props.xDataKey}
          onChange={this.onParamChange}
        />
        <TextField
          id="props.yDataKey"
          label="yDataKey"
          placeholder="yDataKey"
          leftIcon={<FontIcon>tune</FontIcon>}
          className="md-cell md-cell--bottom  md-cell--6"
          defaultValue={props.yDataKey}
          onChange={this.onParamChange}
        />
        <TextField
          id="props.zDataKey"
          label="zDataKey"
          placeholder="zDataKey"
          leftIcon={<FontIcon>tune</FontIcon>}
          className="md-cell md-cell--bottom  md-cell--6"
          defaultValue={props.zDataKey}
          onChange={this.onParamChange}
        />
        
        <div className="md-cell md-cell--bottom  md-cell--6">
          <div className="md-grid">
            <TextField
              id="props.zRange.0"
              label="Range Min"
              placeholder="10"
              className="md-cell md-cell--bottom  md-cell--6"
              defaultValue={props.zRange[0]}
              onChange={this.onRangeParamChange}
              leftIcon={<FontIcon>vertical_align_bottom</FontIcon>}
            />
            <TextField
              id="props.zRange.1"
              label="Range Max"
              placeholder="500"
              className="md-cell md-cell--bottom  md-cell--6"
              defaultValue={props.zRange[1]}
              onChange={this.onRangeParamChange}
              leftIcon={<FontIcon>vertical_align_top</FontIcon>}
            />
          </div>
        </div>
      </span>
    );
  }
}