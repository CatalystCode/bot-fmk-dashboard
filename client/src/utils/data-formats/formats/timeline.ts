import * as _ from 'lodash';
import utils from '../../index';
import { DataFormatTypes, IDataFormat, formatWarn, getPrefix } from '../common';
import { IDataSourcePlugin } from '../../../data-sources/plugins/DataSourcePlugin';

/**
 * Formats a result to suite a timeline (time series) chart
 * 
 * Receives a list of filtering values:
 * values: [
 *   { timestamp: '2015-01-01 00:00:01', line: 'red', value: 40 },
 *   { timestamp: '2015-01-02 00:00:01', line: 'red', value: 50 },
 *   { timestamp: '2015-01-03 00:00:01', line: 'red', value: 60 },
 *   { timestamp: '2015-01-01 00:00:01', line: 'blue', value: 10 },
 *   { timestamp: '2015-01-02 00:00:01', line: 'blue', value: 77 },
 *   { timestamp: '2015-01-03 00:00:01', line: 'blue', value: 30 }
 * ]
 * 
 * And outputs the result in a consumable filter way:
 * result: {
 *   "graphData": [
 *     {"blue": 10, "red": 40, "time": "Wed, 31 Dec 2014 22:00:01 GMT"}, 
 *     {"blue": 77, "red": 50, "time": "Thu, 01 Jan 2015 22:00:01 GMT"}, 
 *     {"blue": 30, "red": 60, "time": "Fri, 02 Jan 2015 22:00:01 GMT"}
 *   ], 
 *   "lines": ["red", "blue"], 
 *   "pieData": [
 *     {"name": "red", "value": 150}, 
 *     {"name": "blue", "value": 117}
 *   ],
 *   "timeFormat": "date"
 * }
 * 
 * @param format { 
 *  type: 'timeline',
 *  args: { 
 *    prefix: string - a prefix string for the exported variables (default to id).
 *    data: string - the state property holding the data (default is 'values').
 *    timeField: 'timestamp' - The field containing timestamp
 *    lineField: 'channel' - A field to hold/group by different lines in the graph
 *    valueField: 'count' - holds the value/y value of the current point
 *  }
 * }
 * @param state Current received state from data source
 * @param dependencies Dependencies for the plugin
 * @param plugin The entire plugin (for id generation, params etc...)
 * @param prevState The previous state to compare for changing filters
 */
export function timeline(
  format: string | IDataFormat, 
  state: any, 
  dependencies: IDictionary, 
  plugin: IDataSourcePlugin, 
  prevState: any) {

  if (typeof format === 'string') { 
    return formatWarn('format should be an object with args', 'timeline', plugin);
  }

  const { timespan } = dependencies;
  const args = format.args || {};
  const { timeField, lineField, valueField } = args;
  const prefix = getPrefix(format);
  let values = state[args.data || 'values'];
  const timeline = values;

  let _timeline: { [time: number] : object} = {};
  let _lines = {};

  timeline.forEach(row => {
    let timestamp = row[timeField];
    let lineFieldValue = lineField === undefined ? valueField : row[lineField];
    let valueFieldValue = parseFloat(row[valueField].toFixed(2));

    let timeValue = (new Date(timestamp)).getTime();

    if (!_timeline[timeValue]) {
        _timeline[timeValue] = { 
          time: (new Date(timestamp)).toUTCString(),
          timeValue: timeValue 
        };
    }

    if (!_lines[lineFieldValue]) {
      _lines[lineFieldValue] = { name: lineFieldValue, value: 0 };
    }

    _timeline[timeValue][lineFieldValue] = valueFieldValue;
    _lines[lineFieldValue].value += valueFieldValue;
  });

  // Sorting by key time as data might be received unsorted
  _timeline = _.sortBy(_timeline, "timeValue");

  let lines = Object.keys(_lines);
  let usage = _.values(_lines);
  let timelineValues = _.map(_timeline, value => {
    lines.forEach(line => {
      if (!value[line]) { value[line] = 0; }
    });
    return value;
  });

  let result = {};
  result[prefix + 'graphData'] = timelineValues;
  result[prefix + 'timeFormat'] = (timespan === '24 hours' ? 'hour' : 'date');
  result[prefix + 'lines'] = lines;
  result[prefix + 'pieData'] = usage;

  return result;
}