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

  onChange(state: IToastStoreState) {
    let { toasts, autohide, autohideTimeout } = state;
    this.setState({
      toasts: toasts.map(o => ({ text: o.text })),
      autohide, 
      autohideTimeout
    });
  }

  componentDidMount() {
    ToastStore.listen(this.onChange);
  }

  render() {
    const {toasts, autohide, autohideTimeout} = this.state;
    return (
      <Snackbar
        toasts={toasts}
        autohide={autohide}
        autohideTimeout={autohideTimeout}
        onDismiss={this.removeToast}
        lastChild={true}
      />
    );
  }

  private removeToast() {
    ToastActions.removeToast();
  }
}