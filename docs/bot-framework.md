# Bot Framework 

A [Bot Framework](https://dev.botframework.com) [Direct Line](https://docs.botframework.com/en-us/restapi/directline3/#navtitle) secret can be added to the list of required connections. This will enable advanced features to be actioned from the dashboard such as 'hand-off' to human.

To get the [Direct Line secret](https://dev.botframework.com/bots/), open the bot's  *Channels* section and under the *Direct Line* listing select 'Edit'. If it's empty then select 'Add new site' to generate the secret keys, or else select the existing site to show secret keys.

## Config 
To enable [Direct Line](https://docs.botframework.com/en-us/restapi/directline3/#navtitle) add 'bot-framework' and the following properties to the dashboard's connections config. 

```js
connections: {
  'bot-framework': { 
    'directLine': "",
    'conversationsEndpoint': "",
    'webchatEndpoint': ""
  }
}
```

## Hand-off to human

In certain cases you might want to be able to hand-off a conversation with a bot to a human agent. 

### Prerequisites 
1. [Create a bot](https://dev.botframework.com/). 
2. [Setup Application Insights](https://azure.microsoft.com/en-gb/services/application-insights/) in Azure portal. 

### Requirements
1. To manage bot hand-off state you will need to [create CosmosDB with MongoDB API](https://azure.microsoft.com/en-gb/services/cosmos-db/). 
   - You may wish to copy the **mongodb** *Connection String* under CosmosDB account settings for later use.
2. Create [Cognitive Services Luis app](https://www.luis.ai) for sentiment analysis. 
   - You may wish to copy the **Luis** *App Id* for later use.

### Installation
You can checkout the [sample QnA project](https://github.com/liliankasem/qna-prompt-sample) or add the hand-off to human functionality into an existing bot using the [botbuilder-handoff](https://www.npmjs.com/package/botbuilder-handoff) npm package.
```
npm install botbuilder-handoff --save
```

* If you need to customise the hand-off package you can checkout the [Bot-HandOff source](https://github.com/palindromed/Bot-HandOff/tree/npm-handoff) which is available on the *npm-handoff* branch.

### Running the sample QnA bot
1. Checkout the [sample Bot HandOff project](https://github.com/liliankasem/qna-prompt-sample) and do npm install.  
```
npm install
```  
2. In this sample the bot will need to be run using the following node environment variables:  
```
MICROSOFT_APP_ID=app_id 
MICROSOFT_APP_PASSWORD=app_password 
MICROSOFT_DIRECTLINE_SECRET=direct_line_secret_key 
MONGODB_PROVIDER='mongodb://cosmos_db_connection_string' 
APPINSIGHTS_INSTRUMENTATIONKEY=app_insights 
CG_SENTIMENT_KEY=luis_app_id 
node dist/app.js
```  
3. Open browser instance(s) at:  
   `http://localhost:3978/webchat?s=direct_line_secret_key` 

   You may wish to refer to the [Bot HandOff readme](https://github.com/palindromed/Bot-HandOff/tree/npm-handoff#set-up-your-customers--agents-and-go) for instructions to act as an **Agent**.  
4. Update your Ibex dashboard config with the Bot Framework details. (Refer to the inline help section for more info.)

### How to setup localhost bot for developer testing

1. [Download ngrok](http://ngrok.com) and add 'ngrok' to your environment path. 
   You can verify installation with `ngrok -v`.
2. Run `ngrok http 3978`
3. Copy your ngrok **Forwarding** address:  
   `https://********.ngrok.io`
4. In [Bot Framework](https://dev.botframework.com/bots/) settings, Configuration section, paste the ngrok **Forwarding** address into the **Messaging endpoint** followed by *'/api/messages'* and **Save changes**. The messaging endpoint should look something like:  
   `https://********.ngrok.io/api/messages`  
