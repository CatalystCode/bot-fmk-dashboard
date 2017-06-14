import * as React from 'react';
import * as _ from 'lodash';

import FontIcon from 'react-md/lib/FontIcons';
import Switch from 'react-md/lib/SelectionControls/Switch';

import { BaseSettings, IBaseSettingsProps, IBaseSettingsState } from '../../common/BaseSettings';

export default class AreaSettings extends BaseSettings<IBaseSettingsState> {

  icon = 'flip_to_front';

  renderChildren() {
    let { settings } = this.props;
    let { id, dependencies, actions, props, title, subtitle, size, theme, type } = settings;
    
    return (
      <span >
        <span className="md-cell md-cell--bottom  md-cell--6">
          <div className="md-grid">
            <span className="md-cell--3 md-cell--middle"><FontIcon>insert_chart</FontIcon></span>
            <span className="md-cell--9 md-cell--bottom">
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
        <span className="md-cell md-cell--bottom  md-cell--6">
          <div className="md-grid">
            <span className="md-cell--3 md-cell--middle"><FontIcon>dns</FontIcon></span>
            <span className="md-cell--9 md-cell--bottom">
              <Switch 
                id="props.isStacked" 
                name="props.isStacked" 
                label="Is Stacked" 
                defaultChecked={props.isStacked} 
                onChange={this.onParamChange} 
              />
            </span>
          </div>
        </span>
      </span>
    );
  }
}