import * as React from 'react';

import ToastStore, { IToastStoreState, IToast } from './ToastStore';
import ToastActions from './ToastActions';

import Snackbar from 'react-md/lib/Snackbars';

export default class Toast extends React.Component<any, IToastStoreState> {

  constructor(props: any) {
    super(props);

    this.state = ToastStore.getState();

    this.onChange = this.onChange.bind(this);
    this.removeToast = this.removeToast.bind(this);
  }

  onChange(state: any) {
    this.setState(state);
  }

  componentDidMount() {
    ToastStore.listen(this.onChange);
  }

  render() {
    return (
      <Snackbar
        toasts={...this.state.toasts}
        autohideTimeout={this.state.autohideTimeout}
        autohide={this.state.autohide}
        onDismiss={this.removeToast}
      />
    );
  }

  private removeToast() {
    ToastActions.removeToast();
  }
}