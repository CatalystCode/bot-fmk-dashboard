// for some reason this needs to have the scheme, host and port specified
// using just /applicationinsights means that the nock tests fail
// hard-coding these values is not ideal but will get fixed when eladiw@
// finishes refactoring the server setup/configuration
const appInsightsUri = 'http://localhost:3000/applicationinsights';

const appId = process.env.REACT_APP_APP_INSIGHTS_APPID;
const apiKey = process.env.REACT_APP_APP_INSIGHTS_APIKEY;

export {
  appInsightsUri,
  appId,
  apiKey
}