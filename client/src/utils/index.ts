import * as moment from 'moment';

export default class Utils {
  static kmNumber(num: any, postfix?: string): string {
    if (isNaN(num)) { return num + (postfix || ''); }

    let value = parseFloat(num);

    return (
      value > 999999 ?
        (value / 1000000).toFixed(1) + 'M' :
        value > 999 ?
          (value / 1000).toFixed(1) + 'K' : 
            (value % 1 * 10) !== 0 ?
            value.toFixed(1).toString() : value.toString()) + (postfix || '');
  }

  static ago(date: Date): string {
    return moment(date).fromNow();
  }

  static convertDashboardToString(dashboard: IDashboardConfig) {
    return Utils.objectToString(dashboard);
  }

  /**
   * Convret a json object with functions to string
   * @param obj an object with functions to convert to string
   */
  static objectToString(obj: Object, indent: number = 0, lf: boolean = false): string {
    
    let result = ''; // (lf ? '\n' : '') + '\t'.repeat(indent);
    let sind = '\t'.repeat(indent);
    let objectType = (Array.isArray(obj) && 'array') || typeof obj;
    
    switch (objectType) {
      case 'object': {

        if (obj === null) { return result = 'null'; }

        // Iterating through all values in object
        let objectValue = '';
        let objectValues = [];
        let valuesStringLength = 0;
        Object.keys(obj).forEach((key: string, idx: number) => {

          let value = Utils.objectToString(obj[key], indent + 1, true);

          // if key contains '.' or '-'
          let skey = key.search(/\.|\-/g) >= 0 ? `"${key}"` : `${key}`;
          let mapping = `${skey}: ${value}`;
          valuesStringLength += mapping.length;

          objectValues.push(mapping);
        });

        if (valuesStringLength + sind.length <= 100) {
          result += `{ ${objectValues.join()} }`;
        } else {
          result += `{\n${sind}\t${objectValues.join(',\n' + sind + '\t')}\n${sind}}`;          
        }

        break;
      }

      case 'string':
        let stringValue = obj.toString();
        let htmlString = stringValue.replace(/^\s+|\s+$/g, ''); // trim any leading and trailing whitespace
        if ( htmlString.startsWith('<') && htmlString.endsWith('>') ) {
          result += '`' + htmlString + '`'; // html needs to be wrapped in back ticks
        } else {
          stringValue = stringValue.replace(/\"/g, '\\"');
          result += `"${stringValue}"`;
        }
        break;

      case 'function': {
        result += obj.toString();
        break;
      }

      case 'number':
      case 'boolean': {
        result += `${obj}`;
        break;
      }

      case 'array': {
        let arrayStringLength = 0;
        let mappedValues = (obj as any[]).map(value => {
          let res = Utils.objectToString(value, indent + 1, true);
          arrayStringLength += res.length;
          return res;
        });

        if (arrayStringLength + sind.length <= 100) {
          result += `[${mappedValues.join()}]`;
        } else {
          result += `[\n${sind}\t${mappedValues.join(',\n' + sind + '\t')}\n${sind}]`;          
        }
        
        break;
      }

      case 'undefined': {
        result += `undefined`;
        break;
      }

      default:
        throw new Error('An unhandled type was found: ' + typeof objectType);
    }

    return result;
  }

  static errorToMessage(error: any): string {
    if (!(error instanceof Error)) {

      if (typeof error === 'object') { return JSON.stringify(error); }

      return error;
    }

    const message = (error as Error).message;
    if (message === '[object ProgressEvent]') {
      return 'There is a problem connecting to the internet.';
    }

    return `Error: ${message}`;
  }
}