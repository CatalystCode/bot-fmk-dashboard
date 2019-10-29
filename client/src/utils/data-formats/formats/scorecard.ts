import * as _ from 'lodash';
import utils from '../../index';
import { DataFormatTypes, IDataFormat, getPrefix } from '../common';
import { IDataSourcePlugin } from '../../../data-sources/plugins/DataSourcePlugin';

/**
 * Formats a result to suite a scorecard
 * 
 * Receives a list of one value:
 * values: [{ count: 99 }]
 * 
 * And outputs the result in a consumable filter way:
 * result: {
 *  "prefix-value": 99,
 *  "prefix-heading": "Heading",
 *  "prefix-color": "#fff",
 *  "prefix-icon": "chat",
 *  "prefix-subvalue": 44,
 *  "prefix-subheading": "Subheading"
 * }
 * 
 * "prefix-selected" will be able to hold the selected values from the filter component
 * 
 * @param format 'scorecard' | { 
 *  type: 'scorecard',
 *  args: { 
 *    prefix: string - a prefix string for the exported variables (default to id).
 *    data: string - the state property holding the data (default is 'values').
 *    countField: 'count' - Field name with count value (default: 'count')
 *    postfix: '%' - String to add after the value (default: null)
 *    thresholds: [{ value: 0, heading: '', color: '#000', icon: 'done' }]
 *    subvalueField: 'other_count' - Other number field to check
 *    subvalueThresholds: [{ subvalue: 0, subheading: '' }]
 *  }
 * }
 * @param state Current received state from data source
 * @param dependencies Dependencies for the plugin
 * @param plugin The entire plugin (for id generation, params etc...)
 * @param prevState The previous state to compare for changing filters
 */
export function scorecard (
  format: string | IDataFormat, 
  state: any, 
  dependencies: IDictionary, 
  plugin: IDataSourcePlugin, 
  prevState: any) {

  const args = typeof format !== 'string' && format.args || { thresholds: null };
  const countField = args.countField || 'count';
  const postfix = args.postfix || null;
  let values = state[args.data || 'values'];

  let checkValue = (values && values[0] && values[0][countField]) || 0; 
  
  let createValue = (value: any, heading: string, color: string, icon: string, subValue?: any, subHeading?: string) => {
    let item = {};
    const prefix = getPrefix(format);
    item[prefix + 'value'] = isFinite(value) ? utils.kmNumber(value, postfix) : '-';
    item[prefix + 'heading'] = heading;
    item[prefix + 'color'] = color;
    item[prefix + 'icon'] = icon;
    item[prefix + 'subvalue'] = isFinite(subValue) ? subValue : '';
    item[prefix + 'subheading'] = subHeading || '';
    return item;
  };

  let thresholds = args.thresholds || [ ];
  if (!thresholds.length) { 
    thresholds.push({ value: checkValue, heading: '', color: '#000', icon: 'done' });
  }
  let firstThreshold = thresholds[0];

  if (!values || !values.length) { 
    return createValue(
      firstThreshold.value, 
      firstThreshold.heading, 
      firstThreshold.color, 
      firstThreshold.icon
    );  
  }

  // Todo: check validity of thresholds and each value

  let thresholdIdx = 0;
  let threshold = thresholds[thresholdIdx];
  
  while (thresholds.length > (thresholdIdx + 1) && 
         checkValue > threshold.value &&    
         checkValue >= thresholds[++thresholdIdx].value) {
    threshold = thresholds[thresholdIdx];      
  }

  let subvalue = null;
  let subheading = null;
  if (args.subvalueField || args.subvalueThresholds) {
    let subvalueField = args.subvalueField || null;
    let subvalueThresholds = args.subvalueThresholds || [];

    if (!subvalueThresholds.length) { subvalueThresholds.push({ subvalue: 0, subheading: '' }); }
    
    let checkSubvalue = values[0][subvalueField || countField] || 0;
    thresholdIdx = 0;
    let subvalueThreshold = subvalueThresholds[thresholdIdx];
    
    while (subvalueThresholds.length > (thresholdIdx + 1) && 
           checkSubvalue > subvalueThreshold.value &&
           checkSubvalue >= subvalueThresholds[++thresholdIdx].value) {
      subvalueThreshold = subvalueThresholds[thresholdIdx];      
    }

    subvalue = checkSubvalue;
    subheading = subvalueThreshold.subheading;
  }

  return createValue(checkValue, threshold.heading, threshold.color, threshold.icon, subvalue, subheading);
}