import * as React from 'react';
import { IConnection, ConnectionEditor, IConnectionProps } from './Connection';
import InfoDrawer from '../../components/common/InfoDrawer';
import TextField from 'react-md/lib/TextFields';

export default class AzureConnection implements IConnection {
  type = 'azure';
  params = [ 'servicePrincipalId', 'servicePrincipalKey', 'servicePrincipalDomain', 'subscriptionId' ];
  editor = AzureConnectionEditor;
}

class AzureConnectionEditor extends ConnectionEditor<IConnectionProps, any> {

  render() {

    let { connection } = this.props;
    connection = connection || {};

    let servicePrincipalUrl = 
      'https://docs.microsoft.com/en-us/azure/azure-resource-manager/' + 
      'resource-group-create-service-principal-portal';

    return (
      <div>
        <h2 style={{ float: 'left', padding: 9 }}>Azure Connection</h2>
        <InfoDrawer 
          width={300} 
          title="Authentication"
          buttonIcon="help"
          buttonTooltip="Click here to learn more about authentications"
        >
          <div>
            Follow the instructions
            in <a href={servicePrincipalUrl} target="_blank">this link</a> to
            get <b>Service Principal ID</b> and <b>Service Principal Key</b>
            <hr/>
            This setup will creates credential for the dashboard to query resources from Azure.
          </div>
        </InfoDrawer>
        <TextField
          id="servicePrincipalId"
          label={'Service Principal Id'}
          defaultValue={connection['servicePrincipalId'] || ''}
          lineDirection="center"
          placeholder="Fill in Service Principal Id"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
        <TextField
          id="servicePrincipalKey"
          label={'Service Principal Key'}
          defaultValue={connection['servicePrincipalKey'] || ''}
          lineDirection="center"
          placeholder="Fill in Service Principal Key"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
        
        <TextField
          id="servicePrincipalDomain"
          label={'Service Principal Domain'}
          defaultValue={connection['servicePrincipalDomain'] || ''}
          lineDirection="center"
          placeholder="Fill in Service Principal Domain"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
        <TextField
          id="subscriptionId"
          label={'Subscription Id'}
          defaultValue={connection['subscriptionId'] || ''}
          lineDirection="center"
          placeholder="Fill in Subscription Id"
          className="md-cell md-cell--bottom"
          onChange={this.onParamChange}
        />
        
      </div>
    );
  }
}