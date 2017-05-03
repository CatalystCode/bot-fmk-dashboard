import * as React from 'react';
import { DataSourceConnector, IDataSourceDictionary } from '../../data-sources';
import { IDictionary, IAction } from '../../types';

export interface IGenericProps {
  id?: string;
  title: string;
  subtitle: string;
  dependencies: { [key: string]: string };
  actions: { [key: string]: IAction };
  props: { [key: string]: Object };
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface IGenericState { [key: string]: any; }

export abstract class GenericComponent<T1 extends IGenericProps, T2 extends IGenericState> 
                      extends React.Component<T1, T2> {

  private id: string = null;

  constructor(props: T1) {
    super(props);

    this.id = props.id || null;
    this.onStateChange = this.onStateChange.bind(this);
    this.trigger = this.trigger.bind(this);

    var result = DataSourceConnector.extrapolateDependencies(this.props.dependencies);
    var initialState: IGenericState = {};
    Object.keys(result.dependencies).forEach(key => {
      initialState[key] = result.dependencies[key];
    });

    this.state = initialState as any;
  }

  componentDidMount() {
    var result = DataSourceConnector.extrapolateDependencies(this.props.dependencies);
    Object.keys(result.dataSources).forEach(key => {

      // Setting initial state to make sure state is updated to the store before future changes
      this.onStateChange(result.dataSources[key].store.state);

      // Listening to future changes in dependant stores
      result.dataSources[key].store.listen(this.onStateChange);
    });
  }

  componentWillUnmount() {
    var result = DataSourceConnector.extrapolateDependencies(this.props.dependencies);
    Object.keys(result.dataSources).forEach(key => {
      result.dataSources[key].store.unlisten(this.onStateChange);
    });
  }

  componentDidUpdate() {

    // This logic is used when the same id is used by two elements that appear in the same area.
    // Since they occupy the same id, componentWillMount/Unmount are not called since react
    //  thinks the same component was updated.
    // Nonetheless, the properties may change and the element's dependencies may change.
    if (this.id !== this.props.id) {
      this.componentWillUnmount();
      this.componentDidMount();
      this.id = this.props.id;
    }
  }

  protected trigger(actionName: string, args: IDictionary) {
    var action = this.props.actions[actionName];

    // if action was not defined, not action needed
    if (!action) {
      console.warn(`no action was found with name ${name}`);
      return;
    }

    var actionId = typeof action === 'string' ? action : action.action;
    var params = typeof action === 'string' ? {} : action.params;
    DataSourceConnector.triggerAction(actionId, params, args);
  }

  abstract render();

  /**
   * returns boolean option from state, passed props or default values (in that order).
   * @param property name of property
   */
  protected is(property: string): boolean {
    if (this.state[property] !== undefined && typeof(this.state[property]) === 'boolean') {
      return this.state[property];
    }
    let { props } = this.props;
    if (props && props[property] !== undefined && typeof(props[property]) === 'boolean') {
      return props[property] as boolean;
    }
    if (this.props[property] !== undefined && typeof(this.props[property]) === 'boolean') {
      return this.props[property];
    }
    return false;
  }

  private onStateChange(state: any) {
    var result = DataSourceConnector.extrapolateDependencies(this.props.dependencies);
    var updatedState: IGenericState = {};
    Object.keys(result.dependencies).forEach(key => {
      updatedState[key] = result.dependencies[key];
    });

    this.setState(updatedState);
  }
}