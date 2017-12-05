import * as _ from 'lodash';
import utils from '../../index';
import { DataFormatTypes, IDataFormat, formatWarn, getPrefix } from '../common';
import { IDataSourcePlugin } from '../../../data-sources/plugins/DataSourcePlugin';

/**
 * Formats a result to suite a bar chart
 * 
 * Receives a list of filtering values:
 * values: [
 *  { count: 10, barField: 'bar 1', seriesField: 'series1Value' },
 *  { count: 15, barField: 'bar 2', seriesField: 'series1Value' },
 *  { count: 20, barField: 'bar 1', seriesField: 'series2Value' },
 *  { count: 44, barField: 'bar 3', seriesField: 'series2Value' },
 * ]
 * 
 * And outputs the result in a consumable filter way:
 * result: {
 *  "prefix-bars": [ 'bar 1', 'bar 2', 'bar 3' ],
 *  "prefix-values": [
 *    { value: 'bar 1', series1Value: 10, series2Value: 20 },
 *    { value: 'bar 2', series1Value: 15, series2Value: 0 },
 *    { value: 'bar 3', series1Value: 0, series2Value: 44 },
 *  ],
 * }
 * 
 * "prefix-selected" will be able to hold the selected values from the filter component
 * 
 * @param format { 
 *  type: 'bars',
 *  args: {
 *    prefix: string - a prefix string for the exported variables (default to id).
 *    data: string - the state property holding the data (default is 'values').
 *    valueField: string - The field name holding the value/y value of the bar
 *    barsField: string - The field name holding the names for the bars
 *    seriesField: string - The field name holding the series name (aggregation in a specific field)
 *    threshold: number - Under this threshold, the values will be aggregated to others (default: 0 - none)
 *    othersValue: string - Name for the 'Others' field (default: 'Others')
 *  }
 * }
 * @param state Current received state from data source
 * @param dependencies Dependencies for the plugin
 * @param plugin The entire plugin (for id generation, params etc...)
 * @param prevState The previous state to compare for changing filters
 */
export function bars(
  format: string | IDataFormat,
  state: any,
  dependencies: IDictionary,
  plugin: IDataSourcePlugin,
  prevState: any) {

  if (typeof format === 'string') {
    return formatWarn('format should be an object with args', 'bars', plugin);
  }

  const args = format.args || {};
  const prefix = getPrefix(format);
  const valueField = args.valueField || 'count';
  const barsField = args.barsField || null;
  const seriesField = args.seriesField || null;
  const threshold = args.threshold || 0;
  const othersValue = args.othersValue || 'Others';

  let values: any[] = state[args.data || 'values'] || [];

  if (values && values.length && (seriesField || barsField)) {
    values.forEach(val => {
      if (seriesField && val[seriesField]) {
        val[seriesField] = val[seriesField];
      }
      if (barsField && val[barsField]) {
        val[barsField] = val[barsField];
      }
    });
  }

  let result = {};
  let barValues: { [time: number] : object} = {};
  let isTimeChart = false;

  // Setting the field describing the bars
  if (barsField) {

    let series = {};
    values.forEach(val => {
      barValues[val[barsField]] = barValues[val[barsField]] || { value: val[barsField] };

      if (threshold && val[valueField] < threshold) {
        barValues[val[barsField]][othersValue] = (barValues[val[barsField]][othersValue] || 0) + val[valueField];
        series[othersValue] = true;
      } else {
        let value = val[seriesField] || valueField;
        barValues[val[barsField]][value] = val[valueField];
        series[value] = true;
      }
    });
    
    // In case all keys are dates - order it and transform the datetimes
    if (_.keys(barValues).every((value) => !Number.isNaN(Date.parse(value)))) {
      barValues = _.sortBy(_.values(barValues), "value");
      
      barValues = _.map(barValues, row => {
        row["time"] = (new Date(row["value"])).getTime()
        isTimeChart = true;
        
        return row;
      });
    }

    result[prefix + 'bars'] = _.keys(series);
    result[prefix + 'bar-values'] = barValues;
    result["isTimeChart"] = isTimeChart;
  } else {
    result[prefix + 'bars'] = [valueField];
    result[prefix + 'bar-values'] = values;
    result["isTimeChart"] = isTimeChart;
  }

  return result;
}