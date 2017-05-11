import * as React from 'react';

interface IConnection {
  type: string;
  params: string[];
  editor: new (props: any) => ConnectionEditor<IConnectionProps, any>;
}

interface IConnectionProps {
  connection: any;
  onParamChange: (connectionKey, paramId, paramValue) => void;
}

abstract class ConnectionEditor<T1 extends IConnectionProps, T2> extends React.Component<T1, T2> {
}

export {
  IConnection,
  IConnectionProps,
  ConnectionEditor
};