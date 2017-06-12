const express = require('express');
const request = require('xhr-request');

const router = new express.Router();

router.post('/query', (req, res) => {
  const { serviceUrl, query, variables } = req.body || { };

  const requestOptions = {
    method: 'POST',
    json: true,
    body: {
      query: query,
      variables: variables
    },
  };

  request(serviceUrl, requestOptions, function(err, data) {
    if (err) { throw err; }
    return res.json(data);
  });
});

module.exports = {
  router
}