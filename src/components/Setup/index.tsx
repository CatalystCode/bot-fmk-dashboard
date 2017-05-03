import * as React from 'react';
import Avatar from 'react-md/lib/Avatars';
import Chip from 'react-md/lib/Chips';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Switch from 'react-md/lib/SelectionControls/Switch';

import InfoDrawer from '../common/InfoDrawer';

import SetupActions from '../../actions/SetupActions';
import SetupStore from '../../stores/SetupStore';

import { ISetupConfig } from '../../types';

interface ISetupState extends ISetupConfig {
  validEmail?: boolean;
  loaded?: boolean;
}

export default class Setup extends React.Component<any, ISetupState> {

  state: ISetupState = {
    admins: null,
    stage: 'none',
    enableAuthentication: false,
    validEmail: true,
    allowHttp: false,
    redirectUrl: '',
    clientID: '',
    clientSecret: '',
    loaded: false
  };

  constructor(props: any) {
    super(props);

    this.checkKeyValue = this.checkKeyValue.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onRemoveAdmin = this.onRemoveAdmin.bind(this);
    this.onSwitchAuthenticationEnables = this.onSwitchAuthenticationEnables.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
  }

  componentDidMount() {

    this.setState(SetupStore.getState());

    SetupActions.load();
    SetupStore.listen(state => {
      this.setState(state);
    });
  }

  validateEmail(email: string): boolean {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  checkKeyValue(e: any) {
    if (e.key === 'Enter') {

      let email = e.target.value;
      if (this.validateEmail(email)) {
        var admins = this.state.admins;
        admins.push(email);
        this.setState({ admins });
        e.target.value = '';
      } else {
        this.setState({ validEmail: false })
      }
      return false;
    }

    this.setState({ validEmail: true });
    return true;
  }

  onSave () {
    SetupActions.save({
      admins: this.state.admins,
      stage: this.state.stage,
      enableAuthentication: this.state.enableAuthentication,
      allowHttp: this.state.allowHttp,
      redirectUrl: this.state.redirectUrl,
      clientID: this.state.clientID,
      clientSecret: this.state.clientSecret
    }, () => {
      window.location.replace('/');
    });
  }

  onCancel () {
    SetupActions.load();
  }

  onRemoveAdmin(admin: string) {
    var admins = this.state.admins;
    var adminIndex = admins.findIndex(adminName => adminName === admin);

    if (adminIndex >= 0) {
      admins.splice(adminIndex, 1);
      this.setState({ admins });
    }
  }

  onSwitchAuthenticationEnables (checked) {
    this.setState({ enableAuthentication: checked });
  };

  onSwitchAllowHttp (checked) {
    this.setState({ allowHttp: checked });
  };

  onFieldChange (value: string, e: any) {
    let state = {};
    state[e.target.id] = value;
    this.setState(state);
  }

  render() {

    let { admins, loaded, validEmail, enableAuthentication, redirectUrl, clientID, clientSecret } = this.state;

    if (!redirectUrl) {
      redirectUrl = window.location.protocol + '//' + window.location.host + '/auth/openid/return';
    }

    if (!loaded) {
      return null;
    }

    let adminChips = (admins || []).map((admin, idx) => (
      <Chip 
        key={idx}
        label={admin} 
        avatar={<Avatar random>{admin.length && admin[0] || '?'}</Avatar>}
        removable
        onClick={this.onRemoveAdmin.bind(this, admin)}
      />
    ));

    return (
      <div style={{ width: '100%' }}>
        <Switch
          id="enableAuthentication" 
          label="Enable Authentication"
          checked={enableAuthentication}
          onChange={this.onSwitchAuthenticationEnables}
          style={{ float: 'left' }}
        />
        <InfoDrawer 
          width={300} 
          title='Authentication'
          buttonIcon='help'
          buttonTooltip='Click here to learn more about authentications'
        >
          <div>
            Follow the instructions
            in <a href='https://auth0.com/docs/connections/enterprise/azure-active-directory' target='_blank'>this link</a> to
            get <b>Client ID</b> and <b>Client Secret</b>
            <hr/>
            Once you set up authentication, the first user you will log in with, will become the administrator.
            <hr/>
            This page (/setup) will continue to be available without authentication as long as you don't set up admin users.
          </div>
        </InfoDrawer>

        <br />
        {
          enableAuthentication && 
            <div>
              <Switch
                id="allowHttp" 
                label="Allow http in authentication responses"
                checked={this.state.allowHttp}
                onChange={this.onSwitchAllowHttp}
              />
              <div className="chip-list">
                {adminChips}
              </div>
              <TextField 
                id="adminEmail"
                label="Administrator Email"
                error={!validEmail}
                errorText={!validEmail && 'Please enter a valid email address'}
                lineDirection="center"
                placeholder="Enter an additional administrator email"
                className="md-cell md-cell--bottom"
                onKeyDown={this.checkKeyValue}
              />
              <TextField 
                id="redirectUrl"
                label="Redirect Url"
                lineDirection="center"
                placeholder="Enter an additional administrator email"
                className="md-cell md-cell--bottom"
                defaultValue={redirectUrl}
                onChange={this.onFieldChange}
              />
              <TextField 
                id="clientID"
                label="Client ID (Application ID)"
                lineDirection="center"
                placeholder="Enter an additional administrator email"
                className="md-cell md-cell--bottom"
                defaultValue={clientID}
                onChange={this.onFieldChange}
              />
              <TextField 
                id="clientSecret"
                label="Client Secret"
                type="password"
                lineDirection="center"
                placeholder="Enter client secret for registered application"
                className="md-cell md-cell--bottom"
                defaultValue={clientSecret}
                onChange={this.onFieldChange}
              />
            </div>
        }
        <Button flat primary label="Save &amp; Apply" onClick={this.onSave}>save</Button>
        <Button flat primary label="Cancel" onClick={this.onCancel}>undo</Button>
      </div>
    );
  }
}
