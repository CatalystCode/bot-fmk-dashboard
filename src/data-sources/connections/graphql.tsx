import * as React from 'react';
import { IConnection, ConnectionEditor, IConnectionProps } from './Connection';
import InfoDrawer from '../../components/common/InfoDrawer';
import TextField from 'react-md/lib/TextFields';

export default class GraphQLConnection implements IConnection {
  type = 'graphql';
  params = [ 'serviceUrl' ];
  editor = GraphQLConnectionEditor;
}

class GraphQLConnectionEditor extends ConnectionEditor<IConnectionProps, any> {

  constructor(props: IConnectionProps) {
    super(props);

    this.onParamChange = this.onParamChange.bind(this);
  }

  onParamChange(value: string, event: any) {
    if (typeof this.props.onParamChange === 'function') {
      this.props.onParamChange(event.target.id, value);
    }
  }

  render() {

    let { connection } = this.props;
    connection = connection || {};

    return (
      <div>
        <h2 style={{ float: 'left', padding: 9 }}>GraphQL Connection</h2>
        <InfoDrawer
          width={300}
          title="Authentication"
          buttonIcon="help"
          buttonTooltip="Click here to learn more about authentication"
        >
          <div>
            Just enter the URL of the GraphQL service you wish to query below.
            Currently only publicly accessible GraphQL endpoints are supported.
          </div>
        </InfoDrawer>
        <TextField
          id="serviceUrl"
          label={'Service URL'}
          defaultValue={connection['serviceUrl'] || ''}
          lineDirection="center"
          placeholder="Fill in Service URL"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
      </div>
    );
  }
}