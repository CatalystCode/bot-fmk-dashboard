import * as React from 'react';
import * as _ from 'lodash';

import {BaseSettings, IBaseSettingsProps, IBaseSettingsState } from '../../common/BaseSettings';

export default class TimelineSettings extends BaseSettings<IBaseSettingsState> {

  icon = 'timeline';

  renderChildren() {
  }
}