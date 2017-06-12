const fs = require('fs');
const path = require('path');
const express = require('express');

const msRestAzure = require('ms-rest-azure');
const AzureServiceClient = msRestAzure.AzureServiceClient;

const router = new express.Router();

router.post('/query', (req, res) => {

  let { servicePrincipalId, servicePrincipalKey, servicePrincipalDomain, subscriptionId, options } = req.body || { };

  // Interactive Login 
  msRestAzure.loginWithServicePrincipalSecret(servicePrincipalId, servicePrincipalKey, servicePrincipalDomain, function(err, credentials) {

    if (err) { return this.failure(err); }

    let client = new AzureServiceClient(credentials, null);

    options.method = options.method || 'GET';
    options.url = `https://management.azure.com` + options.url;

    return client.sendRequest(options, (err, result) => {
      if (err) { throw err; }

      let values = result.value || [];
      return res.json(values);
    });
  });
  
});

module.exports = {
  router
}