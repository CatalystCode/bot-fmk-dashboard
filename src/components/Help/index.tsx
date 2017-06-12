import * as React from 'react';

export default class Help extends React.Component<any, any> {

  render() {

    // tslint:disable:max-line-length
    return (
      <div>
        <h2>Background</h2>
        <p>
          This dashboard is designed to enable querying data on top of <a href="https://docs.microsoft.com/en-us/azure/application-insights/app-insights-analytics" target="_blank">Application Insights Analytics</a>.<br/>
          You can also extend it by developing additional <b>Data Sources</b> or <b>Visual Components</b>.
        </p>
        <br/>
        <h2>Telemetry plugin</h2>
        <p>
          To see all the capabilities of this dashboard, it is recommended to integrate you bot with one of the following:<br/>
          <a href="https://github.com/CatalystCode/bot-fmk-logging" target="_blank">Node.js Telemetry Plugin</a><br/>
          <a href="https://trpp24botsamples.visualstudio.com/_git/Code?path=%2FCSharp%2Fsample-Telemetry&amp;version=GBmaster&amp;_a=contents " target="_blank">C# Telemetry Plugin</a><br/>
          This will enable the bot to send additional telemetry information to Application Insights.
          <br/><br/>
          Keep in mind, the data that is stored on Application Insights is not Hippa compliant.
        </p>
        <br/>
        <h2>Additional Learnings</h2>
        <p>
          This dashboard uses <a href="https://docs.microsoft.com/en-us/azure/application-insights/app-insights-analytics" target="_blank">Application Insights Analytics</a>.<br/>
          You can also run queries directly using <a href="https://dev.applicationinsights.io/apiexplorer/query" target="_blank">API Explorer</a>
        </p>
      </div>
    );
    // tslint:enable:max-line-length
  }
}
