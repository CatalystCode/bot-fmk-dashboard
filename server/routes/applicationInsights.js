const express = require('express');
const request = require('xhr-request');
const path = require('path');

const paths = require('../common/paths');
const resourceFileProvider = require('../helpers/resourceFileProvider');
const resourceFieldProvider = require('../helpers/resourceFieldProvider');

const router = new express.Router();
const appInsightsUri = 'https://api.applicationinsights.io/beta/apps';

router.post('/query', (req, res) => {
  const { query, queryTimespan, appId, dashboardId } = req.body;

  if ( !query || !queryTimespan || !appId ) {
    console.log('Invalid request parameters');
    return res.send({ error: 'Invalid request parameters' });
  }

  // 1. Get the dashboard manifest
  let dashboard = getDashboardById(dashboardId);

  // 1. Get the apiKey from the dashboard
  let apiKey = getApiKeyFromConnection(dashboard, appId);
  
  var url = `${appInsightsUri}/${appId}/query?timespan=${encodeURIComponent(queryTimespan)}`;
  const requestOptions = {
    method: 'POST',
    json: true,
    headers: {
      'x-api-key': apiKey
    },
    body: {
      query: query
    }
  };

  // 2. Make the call to Application Insights API
  request(url, requestOptions, function(err, data) {
    if (err) { throw err; }
    return res.json(data);
  });
});

function getDashboardById(dashboardId) {
  let privateDashboardsPath = paths.resourcesPaths().privateDashboard;
  let dashboardFile = resourceFileProvider.getResourceFileNameById(privateDashboardsPath, dashboardId);
  let dashboardFileContent = resourceFileProvider.getFileContents(path.join(privateDashboardsPath, dashboardFile), false);

  return dashboardFileContent;
}

function getApiKeyFromConnection(dashboard, appId) {
  let connectionsField = resourceFieldProvider.getField('connections', dashboard);

  if (!connectionsField) {
    throw "No connection field was found in the dashboard manifest"
  }

  // find the api key for the given application id
  let apiKeyRegex = '.*' + appId + '",.*apiKey:.*"(.*)".*';
  
  const matches = new RegExp(apiKeyRegex).exec(connectionsField);
  let apiKey = matches && matches.length == 2 && matches[1];

  if (!apiKey) {
    throw "Failed to export apiKey from connections part"
  }

  return apiKey;
}

module.exports = {
  router
}