import * as React from 'react';
import { IConnection, ConnectionEditor, IConnectionProps } from '../Connection';
import InfoDrawer from '../../../components/common/InfoDrawer';
import TextField from 'react-md/lib/TextFields';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import Avatar from 'react-md/lib/Avatars';
import FontIcon from 'react-md/lib/FontIcons';
import QueryTester from './QueryTester';

export default class ApplicationInsightsConnection implements IConnection {
  type = 'application-insights';
  params = [ 'appId', 'apiKey' ];
  editor = AIConnectionEditor;
}

class AIConnectionEditor extends ConnectionEditor<IConnectionProps, any> {

  render() {

    let { connection } = this.props;
    connection = connection || {};

    let accessApiUri = 'https://dev.int.applicationinsights.io/documentation/Authorization/API-key-and-App-ID';

    return (
      <Card className="hide-borders">
        <CardTitle 
          title="Application Insights" 
          avatar={<Avatar icon={<FontIcon>receipt</FontIcon>} />} 
          style={{ float: 'left'}}
        />
        <QueryTester 
          apiKey={connection['apiKey']} 
          applicationID={connection['appId']} 
          buttonStyle={{ float: 'right', margin: 10 }} 
        />
        <InfoDrawer 
          width={300} 
          title="Authentication"
          buttonIcon="help"
          buttonTooltip="Click here to learn more about authentications"
        >
          <div>
            Follow the instructions
            in <a href={accessApiUri} target="_blank">this link</a> to
            get <b>Application ID</b> and <b>Api Key</b>
            <hr/>
            This setup will creates credential for the dashboard to query telemetry 
            information from Application Insights.
          </div>
        </InfoDrawer>
        <TextField
          id="appId"
          label="Application ID"
          defaultValue={connection['appId'] || ''}
          lineDirection="center"
          placeholder="Fill in Application ID"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
        <TextField
          id="apiKey"
          label="API Key"
          defaultValue={connection['apiKey'] || ''}
          lineDirection="center"
          placeholder="Fill in API Key"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
      </Card>
    );
  }
}