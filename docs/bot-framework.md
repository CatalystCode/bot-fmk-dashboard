# Bot Framework 

A [Bot Framework](https://dev.botframework.com) [Direct Line](https://docs.botframework.com/en-us/restapi/directline3/#navtitle) secret can be added to the list of required connections. This will enable advanced features to be actioned from the dashboard such as 'hand-off' to human.

## Config 
To enable [Direct Line](https://docs.botframework.com/en-us/restapi/directline3/#navtitle) add 'bot-framework' and the following properties to the connections config. 

```js
connections: {
  'bot-framework': { 
    'directLine': "",
    'conversationsEndpoint': "",
    'webchatEndpoint': ""
  }
}
```

## Setup hand-off to human

### Setup for localhost development testing

1. [Download ngrok](http://ngrok.com) and add 'ngrok' to your environment path. 
   You can verify installation with `ngrok -v`.
2. Run `ngrok http 3978`
3. Copy your ngrok **Forwarding** address:  
   `https://********.ngrok.io`
4. In [Bot Framework](https://dev.botframework.com/bots/) settings, Configuration section, paste the ngrok **Forwarding** address into the **Messaging endpoint** followed by *'/api/messages'* and **Save changes**. The messaging endpoint should look something like:  
   `https://********.ngrok.io/api/messages`
5. To manage bot hand-off state you will need to [create CosmosDB with MongoDB API](https://azure.microsoft.com/en-gb/services/cosmos-db/) and then copy the 'mongodb' `Connection String` under CosmosDB account settings.
6. Run your bot with hand-off operators as shown in the [sample Bot HandOff project](https://github.com/LilianKasem/Bot-HandOff/tree/operator). In this sample the bot can be run using node environment variables:  
   `MICROSOFT_APP_ID=app_id MICROSOFT_APP_PASSWORD=app_password MICROSOFT_DIRECTLINE_SECRET=direct_line_secret_key MONGODB_PROVIDER='mongodb://cosmos_db_connection_string' node dist/app.js` 
7. Open browser instance(s) at:  
   `http://localhost:3978/webchat?s=direct_line_secret_key` 

   You may wish to refer to the [Bot HandOff readme](https://github.com/LilianKasem/Bot-HandOff/tree/operator#set-up-your-customers--agents-and-go) for acting as an **Agent**.  
8. Update dashboard config with the Bot Framework details. (Refer to the inline help section for more info.)