# Ibex Dashboard [![Build Status](https://travis-ci.org/CatalystCode/ibex-dashboard.png?branch=master)](https://travis-ci.org/CatalystCode/ibex-dashboard)


This is an application insights based project that displays a bots analytics dashboard.

# Preview

[![Preview](/docs/bot-framedash.png)](/docs/bot-framedash.png)
[![Preview](/docs/bot-framedash-msgs.png)](/docs/bot-framedash-msgs.png)

### Show With Your Own Data

1. Clone
2. [Get an Application Insights App ID and Api Key](https://dev.applicationinsights.io/documentation/Authorization/API-key-and-App-ID)

4. Run `cd server; yarn start`
5. Run `cd client; yarn start`
6. Open **http://localhost:3000/**
7. Run through setup and afterwards, fill in **API Key** and **Application ID**

## Deploy To Azure

There are 3 ways to deploy to Azure:



**1. Web App - Automated**

1. Fork this repo (to be able to automatically create github deployment key)
2. After fork, copy the fork url and use it with the following deployment button:

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Ftorosent%2Fibex-dashboard%2Fmaster%2Fscripts%2Fdeployment%2Fwebapp%2Fazuredeploy.json" target="_blank">
    <img src="http://azuredeploy.net/deploybutton.png"/>
</a>

**2. Web App On Linux - Automated with Docker Hub**

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FCatalystCode%2Fibex-dashboard%2Fmaster%2Fscripts%2Fdeployment%2Fwebapponlinux%2Fazuredeploy.json" target="_blank">
    <img src="http://azuredeploy.net/deploybutton.png"/>
</a>

**3. Manual**

1. Fork this repo (to be able to automatically create github deployment key)
2. Clone & Deploy:
3. [Create a new Web App in Azure](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-continuous-deployment)

**Important Note**

Since application insights API doesn't support ARM yet, we need to manually [create an API Key](https://dev.applicationinsights.io/documentation/Authorization/API-key-and-App-ID) for the application insights service.
Once you created the api key, copy and paste it into the **Dashboard settings screen**.

## Deploy With Docker

1. `docker build -t **image name** .`
2. `docker run -d -e PORT=80 **image name** `
3. Docker image is also available at Docker Hub - `docker pull catalystcode/ibex-dashboard`

## Create new API Key and Application ID

The following steps explain how to connect **Application Insights** bot with your bot and your dashboard:
[you can also follow the [official Application Insights article](https://dev.applicationinsights.io/documentation/Authorization/API-key-and-App-ID)].

1. Go to [azure portal](https://portal.azure.com)
2. Select: **Resource Groups** > **[new resource group]** > **App Insights Service**
3. Copy **Instrumentation Key** and paste into your bot registration page (on the bottom)
4. Click: **API Access** > **Create New Key** > **+ Read Telemetry**
5. Copy `Application ID` + `API Key`
6. Open the URL of your web app
7. Under **AppId**/**ApiKey** set the values you created.

# Resources

### Technologies In Use

* http://recharts.org/
* http://www.material-ui.com/

### Resources
This project is built using:

* https://github.com/facebookincubator/create-react-app

The server approach was added using:

* https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/
* https://github.com/fullstackreact/food-lookup-demo
* https://medium.com/@patriciolpezjuri/using-create-react-app-with-react-router-express-js-8fa658bf892d#.14dex6478

Thinking about integrating with:

* https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md


### Assumptions
 1. Running node version 6.11 or above. 

### Installation
```bash
git clone https://github.com/CatalystCode/ibex-dashboard.git
cd ibex-dashboard
(cd client; npm install -g yarn; yarn)
(cd server; npm install -g yarn; yarn)
```

### Dev

```bash
(cd server; yarn start:dev)
(cd client; yarn start:dev)
```

### Test Watcher
Runs the test watcher in an interactive mode.
By default, runs tests related to files changes since the last commit.

```bash
cd client
yarn test
```

Alternatively, you can also run the full commands that the Travis CI server
will run to validate any changes.

```bash
.travis/ci.sh
```

### Build for Production
Our CI server Travis creates new production builds automatically for changes
to master. If you need to create a build locally, you can execute the same
commands as the CI server.

```bash
.travis/build.sh
```

## What’s Inside?

* [webpack](https://webpack.github.io/) with [webpack-dev-server](https://github.com/webpack/webpack-dev-server), [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) and [style-loader](https://github.com/webpack/style-loader)
* [Babel](http://babeljs.io/) with ES6 and extensions used by Facebook (JSX, [object spread](https://github.com/sebmarkbage/ecmascript-rest-spread/commits/master), [class properties](https://github.com/jeffmo/es-class-public-fields))
* [Autoprefixer](https://github.com/postcss/autoprefixer)
* [ESLint](http://eslint.org/)
* [Jest](http://facebook.github.io/jest)
