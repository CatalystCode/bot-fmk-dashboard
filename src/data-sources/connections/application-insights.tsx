import * as React from 'react';
import { IConnection, ConnectionEditor, IConnectionProps } from './Connection';
import InfoDrawer from '../../components/common/InfoDrawer';
import TextField from 'react-md/lib/TextFields';

export default class ApplicationInsightsConnection implements IConnection {
  type = 'application-insights';
  params = [ 'appId', 'apiKey' ];
  editor = AIConnectionEditor;
}

class AIConnectionEditor extends ConnectionEditor<IConnectionProps, any> {

  constructor(props: IConnectionProps) {
    super(props);

    this.onParamChange = this.onParamChange.bind(this);
  }

  onParamChange(value: string, event: any) {
    if (typeof this.props.onParamChange === 'function') {
      this.props.onParamChange('application-insights', event.target.id, value);
    }
  }

  render() {

    let { connection } = this.props;
    connection = connection || {};

    return (
      <div>
        <h2 style={{ float: 'left', padding: 9 }}>Application Insights</h2>
        <InfoDrawer 
          width={300} 
          title='Authentication'
          buttonIcon='help'
          buttonTooltip='Click here to learn more about authentications'
        >
          <div>
            Follow the instructions
            in <a href='https://dev.int.applicationinsights.io/documentation/Authorization/API-key-and-App-ID' target='_blank'>this link</a> to
            get <b>Application ID</b> and <b>Api Key</b>
            <hr/>
            This setup will creates credential for the dashboard to query telemetry information from Application Insights.
          </div>
        </InfoDrawer>
        <TextField
          id="appId"
          label={'Application ID'}
          defaultValue={connection['appId'] || ''}
          lineDirection="center"
          placeholder="Fill in Application ID"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
        <TextField
          id="apiKey"
          label={'API Key'}
          defaultValue={connection['apiKey'] || ''}
          lineDirection="center"
          placeholder="Fill in API Key"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
      </div>
    )
  }
}