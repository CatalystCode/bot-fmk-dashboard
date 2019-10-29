/// <reference path='../../../client/@types/types.d.ts'/>
import * as _ from 'lodash';

/* tslint:disable:indent quotemark max-line-length */
// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: 'bot_analytics_goals_tracking',
  name: 'Bot Analytics Triggered Goals Dashboard',
  icon: 'dashboard',
  url: 'bot_analytics_goals_tracking',
  description: 'Generic goal tracking dashboard',
  preview: '/images/bot-ai-cs.png',
  category: 'Bots',
  html: `
    <div>
      This dashboard is built to view generic goals triggered during a conversation, similar to Goals that can be triggered on a web site in Google Analytics.
      <br/>
      Goals can be captured by capturing a custom event using the Node or C# telemetry modules. To do this, track a custom event with the event name "Goal". 
      An event property called "Name", should then also be added to the event properties list to assign a name to the Goal.
      e.g. in C# you can track a goal using the following snippet.
      <br/>
      <br/>
      var eventProperties = new Dictionary&lt;string, string&gt;();<br/>
      eventProperties.Add("GoalName", "Your goal name");<br/>
      DefaultInstrumentation.TrackCustomEvent(context.Activity, "MBFEvent.GoalEvent", eventProperties);
      <br/>
      <br/>
      This dashboard contains a bar chart which will show the top 3 goals triggered and when the bar chart is clicked a full list of goals
      and their associated counts will be shown. You can then drill into the goals to see the conversations where the goals were triggered.
      <br/>
      <br/>
      <h2>Getting the data to show</h2>
      <p>
        To see all the capabilities of this dashboard, it is recommended to integrate you bot with one of the following:<br/>
        <a href="https://github.com/Azure/botbuilder-instrumentation" target="_blank">Node.js Telemetry Plugin</a>
        <br/>
        <a href="https://github.com/Azure/bot-sample-telemetry" target="_blank">C# Telemetry Plugin</a><br/>
        This will enable the bot to send additional telemetry information to Application Insights.
      </p>
      <br/>
      <h2>Additional Learnings</h2>
      <p>
        This dashboard uses <a href="https://docs.microsoft.com/en-us/azure/application-insights/app-insights-analytics" target="_blank">Application Insights Analytics</a>.<br/>
        You can also run queries directly using <a href="https://dev.applicationinsights.io/apiexplorer/query" target="_blank">API Explorer</a>
      </p>
    </div>
  `,
  config: {
    connections: {},
    layout: {
      isDraggable: true,
      isResizable: true,
      rowHeight: 30,
      verticalCompact: false,
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
    }
  },
  dataSources: [
    {
      id: 'timespan',
      type: 'Constant',
      params: { values: ['24 hours', '1 week', '1 month', '3 months'], selectedValue: '1 month' },
      format: 'timespan'
    },
    {
      id: 'filters',
      type: 'ApplicationInsights/Query',
      dependencies: {
        timespan: 'timespan',
        queryTimespan: 'timespan:queryTimespan',
        granularity: 'timespan:granularity'
      },
      params: {
        table: 'customEvents',
        queries: {
          channels: {
            query: () => `
              where name == 'MBFEvent.UserMessage' 
              | extend value=tostring(customDimensions.channel) 
              | summarize channel_count=count() by value 
              | order by channel_count`,
            format: 'filter'
          }
        }
      }
    },
    {
      id: 'ai',
      type: 'ApplicationInsights/Query',
      dependencies: {
        timespan: 'timespan',
        queryTimespan: 'timespan:queryTimespan',
        granularity: 'timespan:granularity',
        selectedChannels: 'filters:channels-values-selected',
      },
      params: {
        table: 'customEvents',
        queries: {
          goals: {
            query: () => `
              extend GoalName=tostring(customDimensions.GoalName)  
              | where name=="MBFEvent.GoalEvent" 
              | summarize count=count() by GoalName 
              | take 3`,
            filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
            format: { type: "bars", args: { barsField: 'GoalName', seriesField: 'GoalName' } }
          }
        }
      }
    }
  ],
  filters: [
    {
      type: 'TextFilter',
      title: 'Timespan',
      source: 'timespan',
      actions: { onChange: 'timespan:updateSelectedValue' },
      first: true
    },
    {
      type: 'MenuFilter',
      title: 'Channels',
      subtitle: 'Select channels',
      source: 'filters:channels',
      actions: { onChange: 'filters:updateSelectedValues:channels-values-selected' },
      first: true
    },
  ],
  elements: [
    {
      id: 'goals',
      type: 'BarData',
      title: 'Goals Graph',
      subtitle: 'Goals triggered per time',
      size: { w: 8, h: 8 },
      source: 'ai:goals',
      props: { nameKey: 'GoalName' },
      actions: {
        onBarClick: {
          action: 'dialog:goalsTriggeredDialog',
          params: { queryspan: 'timespan:queryTimespan', selectedChannels: 'filters:channels-values-selected' }
        }
      }
    }
  ],
  dialogs: [
    {
      id: 'goalsTriggeredDialog',
      width: '60%',
      params: ['queryspan', 'selectedChannels'],
      dataSources: [
        {
          id: 'goals-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            queryTimespan: 'dialog_goalsTriggeredDialog:queryspan',
            selectedChannels: 'dialog_goalsTriggeredDialog:selectedChannels'
          },
          params: {
            filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
            query: () => `customEvents 
              | extend GoalName=tostring(customDimensions.GoalName) 
              | where name=='MBFEvent.GoalEvent' 
              | summarize count=count() by GoalName 
              | order by GoalName asc`
          }
        }
      ],
      elements: [
        {
          id: 'goals-count-list',
          type: 'Table',
          title: 'Goals Triggered',
          size: { w: 12, h: 16 },
          dependencies: { values: 'goals-data', selectedChannels: 'dialog_goalsTriggeredDialog:selectedChannels' },
          props: {
            cols: [
              { header: 'Goal Name', field: 'GoalName' },
              { header: 'Count', field: 'count' },
              { type: 'button', value: 'chat', click: 'openConversationsDialog' }
            ]
          },
          actions: {
            openConversationsDialog: {
              action: 'dialog:goalConversations',
              params: {
                title: 'args:GoalName',
                goal: 'args:GoalName',
                queryspan: 'timespan:queryTimespan',
                selectedChannels: 'filters:channels-values-selected'
              }
            }
          }
        }
      ]
    },
    {
      id: 'goalConversations',
      width: '60%',
      params: ['title', 'goal', 'queryspan', 'selectedChannels'],
      dataSources: [
        {
          id: 'goal-conversations-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            goal: 'dialog_goalConversations:goal',
            queryTimespan: 'dialog_goalConversations:queryspan',
            selectedChannels: 'dialog_goalConversations:selectedChannels'
          },
          params: {
            filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
            query: ({ goal }) => ` 
              customEvents
              | extend conversation=tostring(customDimensions.conversationId), 
                goal=tostring(customDimensions.GoalName)
              | where name=='MBFEvent.GoalEvent' and goal =~ "${goal}"
              | summarize count=count(), maxTimestamp=max(timestamp) by conversation
              | order by maxTimestamp`,
            mappings: { id: (val, row, idx) => `Conversation ${idx}` }
          }
        }
      ],
      elements: [
        {
          id: 'conversations-list',
          type: 'Table',
          title: 'Conversations',
          size: { w: 12, h: 16 },
          dependencies: { values: 'goal-conversations-data' },
          props: {
            cols: [
              { header: 'Conversation Id', field: 'id' },
              { header: 'Last Message', field: 'maxTimestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { header: 'Count', field: 'count' },
              { type: 'button', value: 'chat', click: 'openMessagesDialog' }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: 'dialog:messages',
              params: {
                title: 'args:id',
                conversation: 'args:conversation',
                queryspan: 'timespan:queryTimespan'
              }
            }
          }
        }
      ]
    },
    {
      id: 'messages',
      width: '50%',
      params: ['title', 'conversation', 'intent', 'queryspan'],
      dataSources: [
        {
          id: 'messages-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            conversation: 'dialog_messages:conversation',
            optional_intent: 'dialog_messages:intent',
            queryTimespan: 'dialog_messages:queryspan'
          },
          params: {
            query: ({ conversation, optional_intent }) => ` 
              customEvents
              | extend intent=tostring(customDimensions.intent), 
                conversation=tostring(customDimensions.conversationId), 
                eventTimestamp=tostring(customDimensions.timestamp),
                userId=tostring(customDimensions.userId)
              | where name == 'MBFEvent.UserMessage' and conversation == '${conversation}'
              | join kind= leftouter (
                customEvents
                | extend sentiment=tostring(customDimensions.score),
                  eventTimestamp=tostring(customDimensions.timestamp), 
                  conversation=tostring(customDimensions.conversationId),
                  userId=tostring(customDimensions.userId)
                | where name == 'MBFEvent.Sentiment' and conversation == '${conversation}'
              ) on eventTimestamp, conversation, userId
              ${optional_intent && `
                | union (
                  customEvents
                  | extend conversation=tostring(customDimensions.conversationId), 
                    intent=tostring(customDimensions.intent),
                    eventTimestamp=tostring(customDimensions.timestamp),
                    userId=tostring(customDimensions.userId)
                  | where name == 'MBFEvent.Intent' 
                    and intent == '${optional_intent}' and conversation == '${conversation}'
                )
              ` || ''}
              | union (
                customEvents
                | extend conversation=tostring(customDimensions.conversationId), 
                  intent=tostring(customDimensions.intent), 
                  eventTimestamp=tostring(customDimensions.timestamp),
                  userId=tostring(customDimensions.userId)
                | where name == 'MBFEvent.BotMessage' and conversation == '${conversation}'
              )
              | project timestamp, eventName=name, message=customDimensions.text, 
                customDimensions.userName, userId, intent, sentiment
              | order by timestamp asc
              `
          },
          calculated: (state, dependencies) => {
            let { values } = state;

            if (!values) { return; }

            _.forEach(values, (msg, index) => {
              msg.message = msg.message;
              msg.icon = isNaN(parseInt(msg.sentiment, 10)) ? '' :
                msg.sentiment > 0.6 ? 'sentiment_satisfied' :
                  msg.sentiment < 0.4 ? 'sentiment_dissatisfied' : '';
              msg.color = isNaN(parseInt(msg.sentiment, 10)) ? '' :
                msg.sentiment > 0.6 ? '#AEEA00' :
                  msg.sentiment < 0.4 ? '#D50000' : '';

              if (msg.eventName === 'MBFEvent.UserMessage') {
                let i = +index;
                let j = i + 1;
                while (j <= i + 5 && j < values.length) {
                  let intent = values[j];
                  if (intent.eventName === 'MBFEvent.Intent' && intent.message === msg.message && intent.intent) {
                    msg.intent = intent.intent;
                    msg.message = '[' + msg.intent + '] ' + msg.message;
                    msg.eventName = msg.eventName + ' intent';
                    break;
                  }
                  j++;
                }
              }
            });

            let chat = values.filter(msg => msg.eventName !== 'MBFEvent.Intent');

            return { chat };
          }
        }
      ],
      elements: [
        {
          id: 'messages-list',
          type: 'Table',
          title: 'Messages',
          size: { w: 12, h: 16 },
          dependencies: { values: 'messages-data:chat' },
          props: {
            rowClassNameField: 'eventName',
            cols: [
              { header: 'Timestamp', width: '50px', field: 'timestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { width: '10px', field: 'icon', type: 'icon', color: 'color' },
              { header: 'Message', width: '500px', field: 'message' }
            ]
          }
        }
      ]
    }
  ]
};
