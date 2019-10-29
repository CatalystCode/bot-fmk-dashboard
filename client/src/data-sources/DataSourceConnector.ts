import alt from '../alt';
import * as _ from 'lodash';
import { IDataSourcePlugin } from './plugins/DataSourcePlugin';
import DialogsActions from '../components/generic/Dialogs/DialogsActions';
import datasourcePluginsMappings from './plugins/PluginsMapping';
import VisibilityActions from '../actions/VisibilityActions';
import VisibilityStore from '../stores/VisibilityStore';
import * as formats from '../utils/data-formats';

const DataFormatTypes = formats.DataFormatTypes;

export interface IDataSource {
  id: string;
  config: any;
  plugin: IDataSourcePlugin;
  action: any;
  store: any;
  initialized: boolean;
}

export interface IDataSourceDictionary {
  [key: string]: IDataSource;
}

export interface IExtrapolationResult {
  dataSources: { [key: string]: IDataSource };
  dependencies: { [key: string]: any };
}

export class DataSourceConnector {

  private static dataSources: IDataSourceDictionary = {};

  static createDataSource(dataSourceConfig: any, connections: IConnections) {

    var config = dataSourceConfig || {};
    if (!config.id || !config.type) {
      throw new Error('Data source configuration must contain id and type');
    }

    // Dynamically load the plugin from the plugins directory
    var path = datasourcePluginsMappings[config.type];

    var PluginClass = require('./plugins/' + path);
    var plugin: any = new PluginClass.default(config, connections);

    // Creating actions class
    var ActionClass = DataSourceConnector.createActionClass(plugin);

    // Creating store class
    var StoreClass = DataSourceConnector.createStoreClass(config, plugin, ActionClass);

    DataSourceConnector.dataSources[config.id] = {
      id: config.id,
      config,
      plugin,
      action: ActionClass,
      store: StoreClass,
      initialized: false
    };

    return DataSourceConnector.dataSources[config.id];
  }

  static createDataSources(dsContainer: IDataSourceContainer, connections: IConnections) {
    dsContainer.dataSources.forEach(source => {
      var dataSource = DataSourceConnector.createDataSource(source, connections);
      DataSourceConnector.connectDataSource(dataSource);
    });

    DataSourceConnector.initializeDataSources();
  }

  static refreshDs() {
    let topLevelDataSources = _.filter(DataSourceConnector.dataSources, ds => !ds.config.dependencies);

    topLevelDataSources.forEach(dataSource => {
      dataSource.action.refresh.defer();
    });
  }

  static initializeDataSources() {
    // Call initialize methods
    Object.keys(this.dataSources).forEach(sourceDSId => {
      var sourceDS = this.dataSources[sourceDSId];

      if (sourceDS.initialized) { return; }

      if (typeof sourceDS.action['initialize'] === 'function') {
        sourceDS.action.initialize.defer();
      }

      sourceDS.initialized = true;
    });
  }

  static extrapolateDependencies(dependencies: IStringDictionary, args?: IDictionary): IExtrapolationResult {
    var result: IExtrapolationResult = {
      dataSources: {},
      dependencies: {}
    };
    Object.keys(dependencies || {}).forEach(key => {

      // Find relevant store
      let dependency = dependencies[key] || '';

      // Checking if this is a constant value
      if (dependency.startsWith('::')) {
        result.dependencies[key] = dependency.substr(2);
        return;
      }

      // Checking if this is a config value
      if (dependency.startsWith('connection:')) {
        const connection = dependency.substr(dependency.indexOf(':') + 1);
        if (Object.keys(DataSourceConnector.dataSources).length < 1) {
          throw new Error('Connection error, couldn\'t find any data sources.');
        }
        // Selects first data source to get connections 
        const dataSource: IDataSource = DataSourceConnector.dataSources[
          Object.keys(DataSourceConnector.dataSources)[0]];
        if (!dataSource || !dataSource.plugin.hasOwnProperty('connections')) {
          throw new Error('Tried to resolve connections reference path, but couldn\'t find any connections.');
        }
        const connections = dataSource.plugin['connections'];
        const path = connection.split('.');
        if (path.length !== 2) {
          throw new Error('Expected connection reference dot path consisting of 2 components.');
        }
        if (!connections.hasOwnProperty(path[0]) || !connections[path[0]].hasOwnProperty(path[1])) {
          throw new Error('Unable to resolve connection reference path:' + connection);
        }
        result.dependencies[key] = connections[path[0]][path[1]];
        return;
      }

      let dependsUpon = dependency.split(':');
      let dataSourceName = dependsUpon[0];

      if (dataSourceName === 'args' && args) {

        if (dependsUpon.length < 2) {
          throw new Error('When padding arguments, you need to provide a specific argument name');
        }

        let valueName = dependsUpon[1];
        result.dependencies[key] = args[valueName];
      } else {
        let dataSource = DataSourceConnector.dataSources[dataSourceName];
        if (!dataSource) {
          throw new Error(`Could not find data source for dependency ${dependency}. 
            If your want to use a constant value, write "value:some value"`);
        }

        let valueName = dependsUpon.length > 1 ? dependsUpon[1] : dataSource.plugin.defaultProperty;
        var state = dataSource.store.getState();

        result.dependencies[key] = state[valueName];
        result.dataSources[dataSource.id] = dataSource;
      }
    });

    // Checking to see if any of the dependencies control visibility
    let visibilityFlags = {};
    let updateVisibility = false;
    Object.keys(result.dependencies).forEach(key => {
      if (key === 'visible') {
        visibilityFlags[dependencies[key]] = result.dependencies[key];
        updateVisibility = true;
      }
    });

    if (updateVisibility) {
      (VisibilityActions.setFlags as any).defer(visibilityFlags);
    }

    return result;
  }

  static triggerAction(action: string, params: IStringDictionary, args: IDictionary) {
    var actionLocation = action.split(':');

    if (actionLocation.length !== 2 && actionLocation.length !== 3) {
      throw new Error(`Action triggers should be in format of "dataSource:action", this is not met by ${action}`);
    }

    var dataSourceName = actionLocation[0];
    var actionName = actionLocation[1];
    var selectedValuesProperty = 'selectedValues';
    if (actionLocation.length === 3) {
      selectedValuesProperty = actionLocation[2];
      args = { [selectedValuesProperty]: args };
    }

    if (dataSourceName === 'dialog') {

      var extrapolation = DataSourceConnector.extrapolateDependencies(params, args);

      DialogsActions.openDialog(actionName, extrapolation.dependencies);
    } else {

      var dataSource = DataSourceConnector.dataSources[dataSourceName];
      if (!dataSource) {
        throw new Error(`Data source ${dataSourceName} was not found`);
      }

      dataSource.action[actionName].call(dataSource.action, args);
    }
  }

  static getDataSources(): IDataSourceDictionary {
    return this.dataSources;
  }

  static getDataSource(name: string): IDataSource {
    return this.dataSources[name];
  }

  static handleDataFormat(
    format: string | formats.IDataFormat,
    plugin: IDataSourcePlugin,
    state: any,
    dependencies: IDictionary) {

    if (!format) { return null; }

    const prevState = DataSourceConnector.dataSources[plugin._props.id].store.getState();

    let result = {};

    let formatName = (typeof format === 'string' ? format : format.type) || DataFormatTypes.none.toString();

    if (formatName && typeof formats[formatName] === 'function') {
      let additionalValues = formats[formatName](format, state, dependencies, plugin, prevState) || {};
      Object.assign(result, additionalValues);
    }

    return result;
  }

  private static connectDataSource(sourceDS: IDataSource) {
    // Connect sources and dependencies
    sourceDS.store.listen((state) => {

      Object.keys(this.dataSources).forEach(checkDSId => {
        let checkDS = this.dataSources[checkDSId];
        let dependencies = checkDS.plugin.getDependencies() || {};

        let populatedDependencies = {};
        let connected = _.find(_.keys(dependencies), dependencyKey => {
          let dependencyValue = dependencies[dependencyKey] || '';
          if (typeof dependencyValue === 'string' && dependencyValue.length > 0)  {
            if (dependencyValue === sourceDS.id) {
              let defaultProperty = sourceDS.plugin.defaultProperty || 'value';
              populatedDependencies[dependencyKey] = state[defaultProperty];
              return true;
            } else if (dependencyValue.startsWith(sourceDS.id + ':')) {
              let property = dependencyValue.substr(sourceDS.id.length + 1);
              populatedDependencies[dependencyKey] = _.get(state, property);
              return true;
            }
          }
          return false;
        });

        if (connected) {

          // Todo: add check that all dependencies are met
          checkDS.action.updateDependencies.defer(populatedDependencies);
        }
      });

      // Checking visibility flags
      let visibilityState = VisibilityStore.getState() || {};
      let flags = visibilityState.flags || {};
      let updatedFlags = {};
      let shouldUpdate = false;
      Object.keys(flags).forEach(visibilityKey => {
        let keyParts = visibilityKey.split(':');
        if (keyParts[0] === sourceDS.id) {
          updatedFlags[visibilityKey] = sourceDS.store.getState()[keyParts[1]];
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        (VisibilityActions.setFlags as any).defer(updatedFlags);
      }
    });
  }

  private static createActionClass(plugin: IDataSourcePlugin): any {
    class NewActionClass {
      constructor() { }
    }

    plugin.getActions().forEach(action => {

      if (typeof plugin[action] === 'function') {

        // This method will be called with an action is dispatched
        NewActionClass.prototype[action] = function (...args: Array<any>) {
          // Collecting depedencies from all relevant stores
          var extrapolation;
          if (args.length === 1) {
            extrapolation = DataSourceConnector.extrapolateDependencies(plugin.getDependencies(), args[0]);
          } else {
            extrapolation = DataSourceConnector.extrapolateDependencies(plugin.getDependencies());
          }

          // Calling action with arguments
          let result = plugin[action].call(this, extrapolation.dependencies, ...args) || {};

          // Checking is result is a dispatcher or a direct value
          if (typeof result === 'function') {
            return (dispatch) => {
              result(function (obj: any) {
                obj = obj || {};
                let fullResult = DataSourceConnector.callibrateResult(obj, plugin, extrapolation.dependencies);
                dispatch(fullResult);
              });
            };
          } else {
            let fullResult = DataSourceConnector.callibrateResult(result, plugin, extrapolation.dependencies);
            return fullResult;
          }
        };
      } else {

        // Adding generic actions that are directly proxied to the store
        alt.addActions(action, <any> NewActionClass);
      }
    });

    // Binding the class to Alt and the plugin
    var ActionClass = alt.createActions(<any> NewActionClass);
    plugin.bind(ActionClass);

    return ActionClass;
  }

  private static createStoreClass(config: any, plugin: any, ActionClass: any): any {
    var bindings = [];
    plugin.getActions().forEach(action => {
      bindings.push(ActionClass[action]);
    });
    class NewStoreClass {
      constructor() {
        (<any> this).bindListeners({ updateState: bindings });
      }

      updateState(newData: any) {
        (<any> this).setState(newData);
      }
    }
    var StoreClass = alt.createStore(NewStoreClass as any, config.id + '-Store');
    return StoreClass;
  }

  private static callibrateResult(result: any, plugin: IDataSourcePlugin, dependencies: IDictionary): any {

    let defaultProperty = plugin.defaultProperty || 'value';

    // In case result is not an object, push result into an object
    if (typeof result !== 'object') {
      var resultObj = {};
      resultObj[defaultProperty] = result;
      result = resultObj;
    }

    // Callibrate calculated values
    const calculated = plugin._props.calculated;

    let state = DataSourceConnector.dataSources[plugin._props.id].store.getState();
    state = _.extend(state, result);

    if (typeof calculated === 'function') {
      let additionalValues = calculated(state, dependencies) || {};
      Object.assign(result, additionalValues);
    }

    if (Array.isArray(calculated)) {
      calculated.forEach(calc => {
        let additionalValues = calc(state, dependencies) || {};
        Object.assign(result, additionalValues);
      });
    }

    state = _.extend(state, result);
    
    let format = plugin.getFormat();
    let formatExtract = DataSourceConnector.handleDataFormat(format, plugin, state, dependencies);
    if (formatExtract) {
      Object.assign(result, formatExtract);
    }

    return result;
  }
}