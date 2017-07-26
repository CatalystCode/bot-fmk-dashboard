
import * as _ from 'lodash';
import {DataSourcePlugin, IOptions} from '../DataSourcePlugin';
import ConstantDatasourceSettings from './Settings';

interface IConstantParams {
  values: Array<string>;
  selectedValue: string;
}

export default class Constant extends DataSourcePlugin<IConstantParams> {
  
  static editor = ConstantDatasourceSettings;
  type = 'Constant';
  defaultProperty = 'selectedValue';

  constructor(options: IOptions<IConstantParams>, connections: IDict<IStringDictionary>) {
    super(options, connections);

    var props = this._props;
    var params = options.params;

    props.actions.push.apply(props.actions, [ 'initialize', 'updateSelectedValue', 'updateSelectedValues' ]);
  }

  initialize() {
    var { selectedValue, values } = <any> this._props.params;
    return { selectedValue, values };
  }

  /**
   * updateDependencies - called when dependencies are created
   */
  dependenciesUpdated(dependencies: IDictionary, args: IDictionary, callback: (result: any) => void) {
    var result = _.extend(dependencies, args);

    if (typeof callback === 'function') {
      return callback(result);
    }

    return result;
  }

  updateSelectedValue(dependencies: IDictionary, selectedValue: any) {
    return { selectedValue };
  }

  updateSelectedValues(dependencies: IDictionary, selectedValues: any) {
    return { selectedValues };
  }
}