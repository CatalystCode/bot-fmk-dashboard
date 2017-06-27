// server/app.js
const express = require('express');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const graphQLRouter = require('./routes/graphql');
const cosmosDBRouter = require('./routes/cosmos-db');
const azureRouter = require('./routes/azure');
const appInsightsRouter = require('./routes/application-insights');

const app = express();


app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  return next();
});

app.use(cookieParser());
app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(authRouter.authenticationMiddleware('/auth', '/api/setup'));
app.use('/auth', authRouter.router);
app.use('/api', apiRouter.router);
app.use('/cosmosdb', cosmosDBRouter.router);
app.use('/azure', azureRouter.router);
app.use('/graphql', graphQLRouter.router)
app.use('/applicationinsights', appInsightsRouter.router)

app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

module.exports = app;