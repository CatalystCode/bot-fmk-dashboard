import * as React from 'react';
import * as _ from 'lodash';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import ApplicationInsightsApi from '../../plugins/ApplicationInsights/ApplicationInsightsApi';
import JSONTree from 'react-json-tree';

interface IQueryTesterState {
  showDialog: boolean;
  query: string;
  response: object;
  loadingData: boolean;
  responseExpanded: boolean;
}

interface IQueryTesterProps {
  applicationID: string;
  apiKey: string;
  buttonStyle: any;
}

const styles = {
  json: { 
    overflowY: 'scroll', 
    height: 'calc(100% - 200px)', 
    width: 'calc(100% - 48px)', 
    position: 'absolute' 
  }
};

export default class QueryTester extends React.Component<IQueryTesterProps, IQueryTesterState> {

  state: IQueryTesterState = {
    showDialog: false,
    query: '',
    response: {},
    loadingData: false,
    responseExpanded: true
  };
  
  constructor(props: any) {
    super(props);

    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.submitQuery = this.submitQuery.bind(this);
    this.onQueryChange = this.onQueryChange.bind(this);
    this.collapseResponse = this.collapseResponse.bind(this);
    this.expandResponse = this.expandResponse.bind(this);
  }

  closeDialog() {
    this.setState({ showDialog: false });
  }

  openDialog() {
    this.setState({ showDialog: true });
  }

  collapseResponse() {
    this.setState({ responseExpanded: false });
  }

  expandResponse() {
    this.setState({ responseExpanded: true });
  }

  submitQuery() {
    this.setState({ loadingData: true, response: {} });

    let appInsightsApi = new ApplicationInsightsApi(this.props.applicationID, this.props.apiKey);
    appInsightsApi.callQuery(this.state.query, (err, json) => {
      this.setState({ loadingData: false, response: json });
    });
  }

  onQueryChange(value: string, event: any) {
    this.setState({ query: value });
  }

  onResponseChange(value: object, event: any) {
    this.setState({ response: value });
  }

  render() {
    let { showDialog, query, response, loadingData, responseExpanded } = this.state;

    const dialogActions = [
            { onClick: this.submitQuery, primary: true, label: 'Run query' },
            { onClick: this.collapseResponse, primary: false, label: 'Collapse', 
            disabled: _.isEmpty(response) || !responseExpanded}, 
            { onClick: this.expandResponse, primary: false, label: 'Expand',
           disabled: _.isEmpty(response) || responseExpanded}, 
            { onClick: this.closeDialog, primary: false, label: 'Close'}
          ];
    
    return (
      <div>
        <Button raised label="Test connection" onClick={this.openDialog} style={this.props.buttonStyle} />
        <Dialog 
          id="testerForm" 
          visible={showDialog} 
          onHide={this.closeDialog} 
          dialogStyle={{ width: '60%', height: '90%' }}
          style={{ zIndex: 99 }}
          title="Query tester"
          actions= {dialogActions}
        >
          <TextField
            id="query"
            placeholder="Place your query here..."
            defaultValue={query}
            block
            paddedBlock
            onChange={this.onQueryChange}
          />
          <Divider />
          <div style={styles.json}>
            <JSONTree data={response} theme="default" shouldExpandNode={() => responseExpanded}/>
          </div>
          {
            loadingData && 
            (
              <div style={{ width: '100%', position: 'absolute', top: 130, left: 0 }}>
                <CircularProgress id="testerProgress" />
              </div>
            )
          }
        </Dialog>  
      </div>
    );
  }
}