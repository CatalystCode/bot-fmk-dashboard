import * as React from 'react';

interface IConnection {
  type: string;
  params: string[];
  editor?: new (props: any) => ConnectionEditor<IConnectionProps, any>;
}

interface IConnectionProps {
  connection: any;
  onParamChange: (paramId: string, paramValue: string) => void;
}

abstract class ConnectionEditor<T1 extends IConnectionProps, T2> extends React.Component<T1, T2> {

  constructor(props: T1) {
    super(props);

    this.onParamChange = this.onParamChange.bind(this);
  }

  onParamChange(value: string, event: any) {
    if (typeof this.props.onParamChange === 'function') {
      const trimmedValue = ('' + value).trim();
      this.props.onParamChange(event.target.id, trimmedValue);
    }
  }
}

export {
  IConnection,
  IConnectionProps,
  ConnectionEditor
};