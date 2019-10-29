
import * as _ from 'lodash';
import { DataSourcePlugin, IOptions } from './DataSourcePlugin';

interface ISampleParams {
  samples: IDictionary;
}

export default class Sample extends DataSourcePlugin<ISampleParams> {

  type = 'Sample';
  defaultProperty = 'values';

  constructor(options: IOptions<ISampleParams>, connections: IDict<IStringDictionary>) {
    super(options, connections);

    var props = this._props;
    var params = options.params;

    props.actions.push.apply(props.actions, [ 'initialize' ]);
  }

  initialize() {
    let { samples } = _.cloneDeep(this._props.params);
    return samples || {};
  }

  /**
   * updateDependencies - called when dependencies are created
   */
  dependenciesUpdated(dependencies: IDictionary, args: IDictionary, callback: (result: any) => void) {
    let result = _.extend(dependencies, args);
    let { samples } = this.getParams();

    _.extend(result, samples);

    if (typeof callback === 'function') {
      return callback(result);
    }

    return result;
  }

  updateSelectedValues(dependencies: IDictionary, selectedValues: any) {
    if (Array.isArray(selectedValues)) {
      return _.extend(dependencies, { 'selectedValues': selectedValues });
    } else {
      return _.extend(dependencies, { ... selectedValues });
    }
  }
}