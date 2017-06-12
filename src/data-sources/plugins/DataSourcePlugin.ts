
import { ToastActions } from '../../components/Toast';

export interface IDataSourceOptions {
  dependencies: (string | Object)[];
  /** This would be variable storing the results */
  dependables: (string | Object)[];
}

export interface ICalculated { 
  [key: string]: (state: Object, dependencies: IDictionary, prevState: Object) => any;
}

export interface IOptions<T> {
  params: T;
}

export interface IDataSourcePlugin {

  type: string;
  defaultProperty: string;
  connectionType: string;

  _props: {
    id: string,
    dependencies: { [key: string]: string },
    dependables: string[],
    actions: string[],
    params: IDictionary,
    calculated: ICalculated
  };

  bind (actionClass: any): void;
  updateDependencies (dependencies: IDictionary, args: IDictionary, callback: () => void): void;
  getDependencies(): { [ key: string]: string };
  getDependables(): string[];
  getActions(): string[];
  getParamKeys(): string[];
  getParams(): IDictionary;
  getCalculated(): ICalculated;
  getConnection(): IStringDictionary;
}

export abstract class DataSourcePlugin<T> implements IDataSourcePlugin {

  abstract type: string;
  abstract defaultProperty: string;
  connectionType: string = null;

  _props = {
    id: '',
    dependencies: {} as any,
    dependables: [],
    actions: [ 'updateDependencies', 'failure', 'updateSelectedValues' ],
    params: <T> {},
    calculated: {}
  };

  /**
   * @param {DataSourcePlugin} options - Options object
   */
  constructor(options: IDictionary, protected connections: IConnections = {}) {

    var props = this._props;
    props.id = options.id;
    props.dependencies = options.dependencies || [];
    props.dependables = options.dependables || [];
    props.actions.push.apply(props.actions, options.actions || []);
    props.params = <T> (options.params || {});
    props.calculated = options.calculated || {};

    this.updateDependencies = this.updateDependencies.bind(this);
    this.updateSelectedValues = this.updateSelectedValues.bind(this);
    this.getCalculated = this.getCalculated.bind(this);
  }

  abstract updateDependencies (dependencies: IDictionary, args: IDictionary, callback: (result: any) => void): void;
  abstract updateSelectedValues (dependencies: IDictionary, selectedValues: any, callback: (result: any) => void): void;

  bind (actionClass: any) {
    actionClass.type = this.type;
    actionClass._props = this._props;
  }

  updateConnections(connections: IConnections) {
    this.connections = connections;
  }

  getConnection(): IConnection {
    return (this.connections && this.connections[this.connectionType]) || {};
  }

  /**
   * @returns {string[]} Array of dependencies
   */
  getDependencies() {
    return this._props.dependencies;
  }

  getDependables() {
    return this._props.dependables;
  }

  getActions() {
    return this._props.actions;
  }

  getParamKeys() {
    return Object.keys(this._props.params);
  }

  getParams(): T {
    return this._props.params;
  }

  getCalculated() {
    return this._props.calculated;
  }

  failure(error: any): void { 
    ToastActions.addToast({ text: this.errorToMessage(error) });
    return error;
  }

  private errorToMessage(error: any): string {
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