import * as React from 'react';
import * as _ from 'lodash';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import ApplicationInsightsApi from '../../plugins/ApplicationInsights/ApplicationInsightsApi';

interface IQueryTesterState {
  showDialog: boolean;
  query: string;
  response: string;
  loadingData: boolean;
  responseHeight: number;
}

interface IQueryTesterProps {
  applicationID: string;
  apiKey: string;
  buttonStyle: any;
}

export default class QueryTester extends React.Component<IQueryTesterProps, IQueryTesterState> {

  state: IQueryTesterState = {
    showDialog: false,
    query: '',
    response: '',
    loadingData: false,
    responseHeight: 100
  };
  
  constructor(props: any) {
    super(props);

    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.submitQuery = this.submitQuery.bind(this);
    this.onQueryChange = this.onQueryChange.bind(this);
  }

  closeDialog() {
    this.setState({ showDialog: false });
  }

  openDialog() {
    this.setState({ showDialog: true });
  }

  submitQuery() {
    this.setState({ loadingData: true, response: '' });

    let appInsightsApi = new ApplicationInsightsApi(this.props.applicationID, this.props.apiKey);
    appInsightsApi.callQuery(this.state.query, json => {
      // and later turn off indicator
      var response = JSON.stringify(json);
      var h = document.getElementById('testerForm').clientHeight - 185;
      this.setState({ loadingData: false, response: response, responseHeight: h });
    });
  }

  onQueryChange(value: string, event: any) {
    this.setState({ query: value });
  }

  render() {
    let { showDialog, query, response, loadingData, responseHeight } = this.state;

    const nav = <Button icon onClick={this.closeDialog}>close</Button>;
    const action = <Button flat label="Send" onClick={this.submitQuery} />;
    
    return (
      <div>
        <Button raised label="Test connection" onClick={this.openDialog} style={this.props.buttonStyle} />
        <Dialog 
          id="testerForm" 
          visible={showDialog} 
          onHide={this.closeDialog} 
          dialogStyle={{ width: '50%', height: '50%' }}
          title="Query tester"
          actions={[
            {
              onClick: this.submitQuery,
              primary: true,
              label: 'Run query',
            }, 
            {
              onClick: this.closeDialog,
              primary: false,
              label: 'Close',
            }
          ]}
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
          <TextField
            id="responseView"
            block
            paddedBlock
            rows={4}
            defaultValue={response}
            disabled
            inputStyle={{ 'max-height': responseHeight }}
          />
          <div 
            style={
              { 
                width: '100%', 
                position: 'absolute', 
                top: 130, 
                left: 0, 
                display: loadingData ? 'block' : 'none'
              }
            }
          >
            <CircularProgress id="testerProgress" />
          </div>
        </Dialog>  
      </div>
    );
  }
}