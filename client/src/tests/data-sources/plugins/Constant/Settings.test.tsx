import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Card from 'react-md/lib/Cards/Card';
import SelectField from 'react-md/lib/SelectFields';
import TokenInput from '../../../../components/common/TokenInput';
import { setupTests } from '../../../utils/setup';
import * as TestUtils from 'react-addons-test-utils';
import { DataSourceConnector, IDataSourceDictionary } from '../../../../data-sources';
import plugins from '../../../../data-sources/plugins';
import { BaseDataSourceSettings, IBaseSettingsProps, IBaseSettingsState } 
                from '../../../../components/common/BaseDatasourceSettings';

import ConstantDatasourceSettings from '../../../../data-sources/plugins/Constant/Settings'
import dashboardMock, {dashboard2} from '../../../mocks/dashboards/constants';

describe('testing data-source settings component', () => {

  it('initializing via editor', () => {
    let element = dashboard2.dataSources[0];
    let ReactElementClass = plugins[element.type];
    if (ReactElementClass && ReactElementClass.editor) {
      let SettingsEditor: any = ReactElementClass.editor;
      let settingsEditor = TestUtils.renderIntoDocument(<SettingsEditor settings={element} />);
      expect(settingsEditor).toBeTruthy();
    }
  });

  it('Selected value displays correctly', () => {
    let element = dashboard2.dataSources[0];
    let ReactElementClass = plugins[element.type];
    if (ReactElementClass && ReactElementClass.editor) {
      let SettingsEditor = ReactElementClass.editor;
      let settingsEditor: any = TestUtils.renderIntoDocument(<SettingsEditor settings={element} />);
      let elements = TestUtils.scryRenderedComponentsWithType(settingsEditor, SelectField);
      expect(elements.length).toBeGreaterThan(0);
      var s:any = elements[0].state;
      expect(s.activeLabel).toEqual(element.params['selectedValue']);
    }
  });

  it('Values were passed correctly to token input', () => {
    let element = dashboard2.dataSources[0];
    let ReactElementClass = plugins[element.type];
    if (ReactElementClass && ReactElementClass.editor) {
      let SettingsEditor = ReactElementClass.editor;
      let settingsEditor: any = TestUtils.renderIntoDocument(<SettingsEditor settings={element} />);
      let elements = TestUtils.scryRenderedComponentsWithType(settingsEditor, TokenInput);
      expect(elements.length).toEqual(1);
      expect(elements[0].props.tokens).toEqual(element.params['values']);
    }
  });
});
