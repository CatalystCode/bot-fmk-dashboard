import * as React from 'react';

import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';
import ListItem from 'react-md/lib/Lists/ListItem';
import Avatar from 'react-md/lib/Avatars';
import SelectField from 'react-md/lib/SelectFields';
import NavigationLink from './NavigationLink';
import { Link } from 'react-router';
import Chip from 'react-md/lib/Chips';

import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

import ConfigurationsStore from '../../stores/ConfigurationsStore';

import './style.css';

const avatarSrc = 'https://cloud.githubusercontent.com/assets/13041/19686250/971bf7f8-9ac0-11e6-975c-188defd82df1.png';

const drawerHeaderChildren = [
  (
    <Avatar
      key={avatarSrc}
      src={avatarSrc}
      role="presentation"
      iconSized={true}
      style={{ alignSelf: 'center', marginLeft: 16, marginRight: 16, flexShrink: 0 }}
    />
  ),
  (
    <SelectField
      id="account-switcher"
      defaultValue="Jonathan"
      menuItems={['Jonathan', 'Fred']}
      key="account-switcher"
      position={SelectField.Positions.BELOW}
      className="md-select-field--toolbar"
    />
  )
];

export default class Navbar extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = AccountStore.getState();
    AccountStore.listen((state) => {
      this.setState(state);
    });
    AccountActions.updateAccount();

    ConfigurationsStore.listen((state) => {
      this.setState({
        dashboards: state.dashboards
      });
    });
  }

  render() {
    let { dashboards } = this.state;
    let { children, title } = this.props;
    let pathname = '/';
    try { pathname = window.location.pathname; } catch (e) { }

    let navigationItems = [
      (
        <ListItem
          key="0"
          component={Link}
          href="/"
          active={pathname === '/'}
          leftIcon={<FontIcon>home</FontIcon>}
          tileClassName="md-list-tile--mini"
          primaryText={'Home'}
        />
      ),
      (
        <ListItem
          key="1"
          component={Link}
          href="/about"
          active={pathname === '/about'}
          leftIcon={<FontIcon>help_outline</FontIcon>}
          tileClassName="md-list-tile--mini"
          primaryText={'Help'}
        />
      ),
      (
        <ListItem
          key="2"
          component={Link}
          href="/setup"
          active={pathname === '/setup'}
          leftIcon={<FontIcon>settings</FontIcon>}
          tileClassName="md-list-tile--mini"
          primaryText={'Settings'}
        />
      )
    ];

    (dashboards || []).forEach((dashboard, index) => {
      let name = dashboard.name || null;
      let url = '/dashboard/' + (dashboard.url || index.toString());
      let active = pathname === url;
      if (!title && active && name) {
        title = name;
      }

      navigationItems.push(
        (
          <ListItem
            key={index + 4}
            component={Link}
            href={url}
            active={active}
            leftIcon={<FontIcon>{dashboard.icon || 'dashboard'}</FontIcon>}
            tileClassName="md-list-tile--mini"
            primaryText={name || 'Dashboard'}
          />
        )
      )
    });
    

    let toolbarActions = 
        this.state.account ?
          <Chip style={{ marginRight: 30 }} label={'Hello, ' + this.state.account.displayName} /> :
          null;

    if (!title) {
      switch (window.location.pathname) {
        case '/':
          title = 'Home';
          break;

        case '/about':
          title = 'Help';
          break;

        case '/dashboard':
          title = 'Dashboard';
          break;

        case '/dashboard/config':
          title = 'Dashboard Configuration';
          break;

        case '/setup':
          title = 'Setup Dashboard';
          break;

        default:

          title = 'Ibex Dashboard';
          break;
      }
    }

    return (
      <div>
        <NavigationDrawer
          navItems={navigationItems}
          contentClassName="md-grid"
          drawerHeaderChildren={drawerHeaderChildren}
          mobileDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
          tabletDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
          desktopDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
          toolbarTitle={title}
          toolbarActions={toolbarActions}
        >
          {children}
        </NavigationDrawer>
      </div>
    );
  }
}