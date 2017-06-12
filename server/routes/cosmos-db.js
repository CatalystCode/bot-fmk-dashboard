const express = require('express');
const request = require('xhr-request');
const router = new express.Router();
const crypto = require('crypto');

router.post('/query', (req, res) => {
  const { host, key, verb, resourceType, databaseId, collectionId, query, parameters } = req.body;

  if ( !host || !key || !verb || !resourceType || !databaseId || !collectionId || !query ) {
    console.log('Invalid request parameters');
    return res.send({ error: 'Invalid request parameters' });
  }

  const date = new Date().toUTCString();
  const resourceLink = `dbs/${databaseId}/colls/${collectionId}`;
  const auth = getAuthorizationTokenUsingMasterKey(verb, resourceType, resourceLink, date, key);

  let cosmosQuery = {
    query: query,
    parameters: parameters || [],
  };

  const url = `https://${host}.documents.azure.com/${resourceLink}/docs`;

  request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/query+json',
      'Accept': 'application/json',
      'Authorization': auth,
      'x-ms-date': date,
      'x-ms-version': '2015-04-08',
      'x-ms-documentdb-isquery': true,
    },
    body: cosmosQuery,
    responseType: 'json',
    json: true,
  }, (err, doc) => {
    if (err) {
      console.log(err);
      return res.send({ error: err });
    }
    res.send(doc);
  });

});

function getAuthorizationTokenUsingMasterKey(verb, resourceType, resourceLink, date, masterKey) {
  var key = new Buffer(masterKey, "base64");
  var text = (verb || "").toLowerCase() + "\n" +
    (resourceType || "").toLowerCase() + "\n" +
    (resourceLink || "") + "\n" +
    date.toLowerCase() + "\n" +
    "" + "\n";
  var body = new Buffer(text, "utf8");
  var signature = crypto.createHmac("sha256", key).update(body).digest("base64");
  var MasterToken = "master";
  var TokenVersion = "1.0";
  return encodeURIComponent("type=" + MasterToken + "&ver=" + TokenVersion + "&sig=" + signature);
}

module.exports = {
  router
}