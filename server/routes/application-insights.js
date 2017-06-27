const express = require('express');
const request = require('xhr-request');
const router = new express.Router();

const host = 'api.applicationinsights.io';

router.post('/query', (req, res) => {
  const { apiKey, appId, query, queryTimespan } = req.body;

  if (!apiKey || !appId) {
    return res.send({ error: 'Invalid request parameters: API key and app ID are required' });
  }

  let url = `https://${host}/beta/apps/${appId}/query`;
  if (queryTimespan) url += `?timespan=${queryTimespan}`;

  request(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: {
      query,
    },
    json: true,
  }, (err, result) => {
    if (err) {
      return res.send({ error: err });
    }
    res.send(result);
  });

});

module.exports = {
  router,
};