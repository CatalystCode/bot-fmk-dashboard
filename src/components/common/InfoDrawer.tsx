import * as React from 'react';

import Button from 'react-md/lib/Buttons/Button';
import Toolbar from 'react-md/lib/Toolbars';
import Drawer from 'react-md/lib/Drawers';
import Media from 'react-md/lib/Media/Media';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';

interface IInfoDrawerState {
  open: boolean;
}

interface IInfoDrawerProps {
  title?: string;
  width?: number;
  children?: any;
  buttonLabel?: string;
  buttonTooltip?: string;
  buttonIcon?: string;
  buttonStyle?: any;
}

export default class InfoDrawer extends React.Component<IInfoDrawerProps, IInfoDrawerState> {

  state: IInfoDrawerState = {
    open: false
  };

  constructor(props: IInfoDrawerProps) {
    super(props);

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  open() {
    this.setState({ open: true });
  }

  close() {
    this.setState({ open: false });
  }

  render() {

    let { open } = this.state;
    let { width, title, buttonTooltip, buttonIcon, buttonLabel, buttonStyle } = this.props;

    const drawerHeader = (
      <Toolbar
        title={title}
        nav={<Button icon onClick={this.close}>close</Button>}
        className="md-divider-border md-divider-border--bottom"
      />
    );

    return (
      <div>
        <div style={{ width: 310 }}>
          <Button
            icon={!!buttonIcon}
            tooltipLabel={buttonTooltip}
            onClick={this.open}
          >
            {buttonIcon}

          </Button>
          {buttonLabel && (
            <span onClick={this.open} style={{ float: 'right', marginTop: 15 }}>
              {buttonLabel}
            </span>
          )}
        </div>
        <Drawer
          visible={open}
          defaultVisible={false}
          onVisibilityToggle={() => {}}
          position={'right'}
          type={Drawer.DrawerTypes.TEMPORARY}
          header={drawerHeader}
          style={{ zIndex: 100 }}
        >
          <Media style={{ padding: 20, maxWidth: 300, width: width || 'auto', height: '100%' }}>
            {this.props.children}
          </Media>
        </Drawer>
      </div>
    );
  }
}