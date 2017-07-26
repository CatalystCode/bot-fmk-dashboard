import * as React from 'react';

import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import Toolbar from 'react-md/lib/Toolbars';
import FontIcon from 'react-md/lib/FontIcons';
import ListItem from 'react-md/lib/Lists/ListItem';
import Avatar from 'react-md/lib/Avatars';
import SelectField from 'react-md/lib/SelectFields';
import NavigationLink from './NavigationLink';
import { Link } from 'react-router';
import Chip from 'react-md/lib/Chips';
import Menu from 'react-md/lib/Menus/Menu';
import MenuButton from 'react-md/lib/Menus/MenuButton';
import Button from 'react-md/lib/Buttons';

import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

import ConfigurationsStore from '../../stores/ConfigurationsStore';

import './style.css';

const drawerHeaderChildren = [
  (
    <div key={0} style={{ alignSelf: 'center', marginLeft: 16, marginRight: 16, flexShrink: 0 }}>
      <h3>Ibex Dashboard</h3>
    </div>
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

  componentDidMount() {
    // Checking if running locally and authentication is activated
    // This is a mitigation that handles authentication in local environment
    // that relies on two ports and redirections.
    if (window.location.port === '3000' && window.location.hostname === 'localhost') {
      setTimeout(
        () => {
          if (!window['dashboardTemplates']) {
            this.setState({ noTemplates: true });
          }
        },
        5000
      );
    }
  }

  render() {
    let { dashboards, noTemplates } = this.state;
   
    let { children, title } = this.props;
    let pathname = '/';
    try { pathname = window.location.pathname; } catch (e) { }

    let navigationItems = [];
    let toolbarTitle = null;

    (dashboards || []).forEach((dashboard, index) => {
      let name = dashboard.name || null;
      let url = '/dashboard/' + (dashboard.url || index.toString());
      let active = pathname === url;
      if (!title && active && name) {
        title = name;
        toolbarTitle = !dashboard.logo ? name : (
          <span>
            <span className="title-logo"><img src={dashboard.logo} /></span>
            <span>{name}</span>
          </span>
        );
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
      );
    });

    if (!toolbarTitle) {
      switch (window.location.pathname) {
        case '/':
          toolbarTitle = 'Create Dashboard';
          break;

        case '/about':
          toolbarTitle = 'Help';
          break;

        case '/dashboard':
          toolbarTitle = 'Dashboard';
          break;

        case '/dashboard/config':
          toolbarTitle = 'Dashboard Configuration';
          break;

        case '/setup':
          toolbarTitle = 'Setup Authentication';
          break;

        default:

          toolbarTitle = 'Ibex Dashboard';
          break;
      }
    }

    const drawerType = navigationItems.length > 0 ?
      NavigationDrawer.DrawerTypes.TEMPORARY_MINI : NavigationDrawer.DrawerTypes.TEMPORARY;

    const toolbarActions = [(
      <Button
        icon
        tooltipLabel="Create Dashboard"
        href="/"
        component={Link}
      >add_box
      </Button>),
      , (
      <MenuButton
        id="vert-menu"
        icon
        buttonChildren="more_vert"
        position={Menu.Positions.BOTTOM_RIGHT}
      >
        {
          this.state.account ? (
            <ListItem
              primaryText={this.state.account.displayName}
              leftAvatar={<Avatar>this.state.account.displayName.charAt(0).toUpperCase()</Avatar>}
              disabled
            />
          ) : (
              <ListItem
                primaryText="Anon"
                leftAvatar={<Avatar icon={<FontIcon>perm_identity</FontIcon>} />}
                disabled
              />
            )
        }
        <ListItem
          primaryText="Setup Authentication"
          href="/setup"
          active={pathname === '/setup'}
          component={Link}
          leftIcon={<FontIcon>lock</FontIcon>}
        />
      </MenuButton>
    )];

    if (noTemplates && !dashboards && window.location.pathname !== '/setup') {
      children = (
        <div>
          <h1>There's seems to be a problem</h1>
          <span>If you are running locally, ensure to first open </span>
          <a target="_blank" href="http://localhost:4000">http://localhost:4000</a>
          <span> and then </span>
          <a href="http://localhost:3000">http://localhost:3000</a>.
        </div>
      );
    }

    return (
      <div>
        {navigationItems.length > 0 ? (
          <NavigationDrawer
            navItems={navigationItems}
            contentClassName="md-grid"
            drawerHeaderChildren={drawerHeaderChildren}
            mobileDrawerType={drawerType}
            tabletDrawerType={drawerType}
            desktopDrawerType={drawerType}
            toolbarTitle={toolbarTitle}
            toolbarActions={toolbarActions}
          >
            {children}
          </NavigationDrawer>
        ) : (
            <div>
              <Toolbar title={toolbarTitle} actions={toolbarActions} colored />
              <div className="md-grid">
                {children}
              </div>
            </div>
          )}
      </div>
    );
  }
}