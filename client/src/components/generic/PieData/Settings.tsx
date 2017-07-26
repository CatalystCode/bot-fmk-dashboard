import * as React from 'react';
import * as _ from 'lodash';

import FontIcon from 'react-md/lib/FontIcons';
import Switch from 'react-md/lib/SelectionControls/Switch';

import { BaseSettings, IBaseSettingsProps, IBaseSettingsState } from '../../common/BaseSettings';

export default class PieSettings extends BaseSettings<IBaseSettingsState> {

  icon = 'pie_chart';

  renderChildren() {
    let { settings } = this.props;
    let { id, dependencies, actions, props, title, subtitle, size, theme, type } = settings;

    return (
      <span className="md-cell md-cell--bottom  md-cell--6">
        <div className="md-grid">
          <span className="md-cell--1 md-cell--middle"><FontIcon>insert_chart</FontIcon></span>
          <span className="md-cell--11 md-cell--bottom">
            <Switch 
              id="props.showLegend" 
              name="props.showLegend" 
              label="Show legend" 
              defaultChecked={props.showLegend} 
              onChange={this.onParamChange} 
            />
          </span>
        </div>
      </span>
    );
  }
}