import * as _ from 'lodash';
import utils from '../../index';
import { DataFormatTypes, IDataFormat, formatWarn, getPrefix } from '../common';
import { IDataSourcePlugin } from '../../../data-sources/plugins/DataSourcePlugin';

enum Interval {
  Hours = 0,
  Days = 1,
  Weeks= 2,
  Months = 3
}

interface IQueryTimespan {
  queryTimespan: string;
  granularity: string;
}

const timespanRegex = /^(\d+) (hour|day|week|month)s?$/;
function parseTimespan(timespanText: string) : IQueryTimespan {
  var match = timespanRegex.exec(timespanText);
  if (!match) {
    // Backwards compatibility with existing functionality
    return { queryTimespan: "P90D", granularity: "1d" };
  }

  switch (match[2]) {
    case "hour":
      return { queryTimespan: `PT${match[1]}H`, granularity: "5m" };
    case "day":
      return { queryTimespan: `P${match[1]}D`, granularity: "30m" };
    case "week":
      return { queryTimespan: `P${parseInt(match[1]) * 7}D`, granularity: "1d" };
    case "month":
      return { queryTimespan: `P${parseInt(match[1]) * 30}D`, granularity: "1d" };
    default:
      return { queryTimespan: "P90D", granularity: "1d" };
  }
}

/**
 * Receives a timespan data source and formats is accordingly
 * 
 * Receives a list of filtering values (on the data source params variable):
 * params: {
 *  values: ["24 hours","1 week","1 month","3 months"]
 *  selectedValue: "1 month",
 *  queryTimespan: "PT24H",
 *  granularity: "5m"
 * }
 * 
 * And outputs the result in a consumable filter way:
 * result: {
 *  "prefix-values": ["24 hours","1 week","1 month","3 months"]
 *  "prefix-selected": "1 month",
 * }
 * 
 * "prefix-selected" will be able to hold the selected values from the filter component
 * 
 * @param format 'timespan' | { 
 *  type: 'timespan',
 *  args: { 
 *    prefix: string - a prefix string for the exported variables (default to id).
 *    data: string - the state property holding the data (default is 'values').
 *  }
 * }
 * @param state Current received state from data source
 * @param dependencies Dependencies for the plugin
 * @param plugin The entire plugin (for id generation, params etc...)
 * @param prevState The previous state to compare for changing filters
 */
export function timespan(
  format: string | IDataFormat, 
  state: any, 
  dependencies: IDictionary, 
  plugin: IDataSourcePlugin, 
  prevState: any) {

  if (!state) { return null; }

  const params = plugin.getParams();
  const prefix = getPrefix(format);

  let result = parseTimespan(state.selectedValue);

  const args = typeof format !== 'string' && format.args || {};
  let values = params[args.data || 'values'];

  result[prefix + 'values-all'] = values;
  result[prefix + 'values-selected'] = state.selectedValue;

  return result;
}