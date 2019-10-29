/// <reference path='../../../client/@types/types.d.ts'/>
import * as _ from 'lodash';

// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: 'bot_analytics_dashboard',
  name: 'Bot Analytics Basic Dashboard',
  icon: 'dashboard',
  url: 'bot_analytics_dashboard',
  description: 'Microsoft Bot Framework based analytics',
  preview: '/images/bot-ai-base.png',
  category: 'Bots',
  html: `
    <div>
      This dashboard is built to view the events being sent by the Bot Framework sent for a registered bot.
      <br/>
      <br/>
      <h2>Getting Additional Telemetry</h2>
      <p>
        Parts of this dashboard will not be functional unless you add additional telemetry 
        with one of the following plugins:
        <br/>
        <a href="https://github.com/Azure/botbuilder-instrumentation" target="_blank">
          Node.js Telemetry Plugin
        </a>
        <br/>
        <a href="https://github.com/Azure/bot-sample-telemetry" target="_blank">C# Telemetry Plugin</a>
        <br/>
        This will enable the bot to send additional telemetry information to Application Insights.
        <br/>
        <br/>
        If you are connecting your bot to one of these instrumentation modules, 
        <b>Bot Analytics Instrumented Dashboard</b> will give you a better view of your data.
      </p>
      <h2>Additional Learnings</h2>
      <p>
        This dashboard uses 
        <a href="https://docs.microsoft.com/en-us/azure/application-insights/app-insights-analytics" target="_blank">
          Application Insights Analytics
        </a>.
        <br/>
        You can also run queries directly using 
        <a href="https://dev.applicationinsights.io/apiexplorer/query" target="_blank">API Explorer</a>
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
      id: 'modes',
      type: 'Constant',
      params: { values: ['messages', 'users'], selectedValue: 'messages' },
      format: 'flags'
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
          },
          intents: {
            query: () => `
              extend value=tostring(customDimensions.intent), cslen=customDimensions.callstack_length 
              | where name=='MBFEvent.Intent' and (cslen == 0 or strlen(cslen) == 0) and strlen(value) > 0 
              | summarize intent_count=count() by value 
              | order by intent_count`,
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
        selectedIntents: 'filters:intents-values-selected'
      },
      params: {
        table: 'customEvents',
        queries: {
          timeline: {
            query: ({ granularity }) => `
								where name == 'Activity' 
                | summarize count=count() by bin(timestamp, ${granularity}), 
                  name, channel=tostring(customDimensions.channel) 
								| order by timestamp asc `,
            filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
            format: { type: 'timeline', args: { timeField: 'timestamp', lineField: 'channel', valueField: 'count' } }
          },
          'users-timeline': {
            query: ({ granularity }) => `
                where name == 'Activity' 
                | summarize count=dcount(tostring(customDimensions.from)) by bin(timestamp, ${granularity}), 
                  name, channel=tostring(customDimensions.channel) 
                | order by timestamp asc`,
            filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
            format: { type: 'timeline', args: { timeField: 'timestamp', lineField: 'channel', valueField: 'count' } }
          },
          intents: {
            query: () => `
            extend cslen=customDimensions.callstack_length, value=tostring(customDimensions.intent) 
            | where name=='MBFEvent.Intent' and (cslen == 0 or strlen(cslen) == 0) and strlen(value) > 0 
            | summarize count=count() by value`,
            filters: [{ dependency: 'selectedIntents', queryProperty: 'customDimensions.intent' }],
            format: 'bars'
          },
          conversions: {
            query: () => `
            extend successful=tostring(customDimensions.successful == 'true') 
            | where name in ('MBFEvent.StartTransaction', 'MBFEvent.EndTransaction') 
            | summarize event_count=count() by name, successful`,
            filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
            format: {
              type: 'scorecard',
              args: {
                postfix: '%',
                thresholds: [{ value: 0, color: '#2196F3', icon: 'input', heading: 'Conversions' }]
              }
            }
          },
          mapActivity: {
            query: () => `
            where name=='MBFEvent.UserMessage' 
            | extend location=strcat(client_City, ', ', client_CountryOrRegion) 
            | summarize location_count=count() by location 
            | extend popup=strcat('<b>', location, '</b><br />', location_count, ' messages') `,
            filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }]
          },
          sentiments: {
            query: () => `
            where name startswith 'MBFEvent.Sentiment'  
            | extend score=customDimensions.score 
            | summarize sentiment=avg(todouble(score))`,
            format: {
              type: 'scorecard',
              args: {
                postfix: '%',
                thresholds: [
                  { value: 0, color: '#D50000', icon: 'sentiment_dissatisfied', heading: 'Sentiment' },
                  { value: 40, color: '#FF9810', icon: 'sentiment_neutral', heading: 'Sentiment' },
                  { value: 60, color: '#AEEA00', icon: 'sentiment_satisfied', heading: 'Sentiment' }
                ],
                subvalueThresholds: [
                  { value: 0, subheading: 'Negative' },
                  { value: 40, subheading: 'Neutral' },
                  { value: 60, subheading: 'Positive' }
                ]
              }
            }
          }
        }
      }
    },
    {
      id: 'errors',
      type: 'ApplicationInsights/Query',
      dependencies: { timespan: 'timespan', queryTimespan: 'timespan:queryTimespan' },
      params: { query: () => `exceptions | summarize count=count()` },
      format: {
        type: 'scorecard',
        args: {
          thresholds: [
            { value: 0, color: '#AEEA00', heading: 'Errors', icon: 'done', subheading: 'Avg' },
            { value: 1, color: '#D50000', heading: 'Errors', icon: 'bug_report', subheading: 'Avg' }
          ]
        }
      }
    },
    {
      id: 'retention',
      type: 'ApplicationInsights/Query',
      dependencies: { timespan: 'timespan', selectedTimespan: 'timespan:queryTimespan', queryTimespan: '::P90D' },
      params: {
        query: () => `
          customEvents 
          | where name=='Activity' 
          | extend uniqueUser=tostring(customDimensions.from)
          | summarize oldestVisit=min(timestamp), lastVisit=max(timestamp) by uniqueUser 
          | summarize
            totalUnique = dcount(uniqueUser),
            totalUniqueUsersIn24hr = countif(lastVisit > ago(24hr)),
            totalUniqueUsersIn7d = countif(lastVisit > ago(7d)),
            totalUniqueUsersIn30d = countif(lastVisit > ago(30d)),
            returning24hr = countif(lastVisit > ago(24hr) and oldestVisit <= ago(24hr)),
            returning7d = countif(lastVisit > ago(7d) and oldestVisit <= ago(7d)),
            returning30d = countif(lastVisit > ago(30d) and oldestVisit <= ago(30d))`
      },
      format: 'retention'
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
      type: 'TextFilter',
      title: 'Mode',
      source: 'modes',
      actions: { onChange: 'modes:updateSelectedValue' },
      first: true
    },
    {
      type: 'MenuFilter',
      title: 'Channels',
      subtitle: 'Select channels',
      source: 'filters:channels',
      actions: { onChange: 'filters:updateSelectedValues:channels-selected' },
      first: true
    },
    {
      type: 'MenuFilter',
      title: 'Intents',
      subtitle: 'Select intents',
      source: 'filters:intents',
      actions: { onChange: 'filters:updateSelectedValues:intents-selected' },
      first: true
    }
  ],
  elements: [
    {
      id: 'timeline',
      type: 'Timeline',
      title: 'Message Rate',
      subtitle: 'How many messages were sent per timeframe',
      size: { w: 5, h: 8 },
      source: 'ai:timeline',
      dependencies: { visible: 'modes:messages' }
    },
    {
      id: 'timeline',
      type: 'Timeline',
      title: 'Users Rate',
      subtitle: 'How many users were sent per timeframe',
      size: { w: 5, h: 8 },
      source: 'ai:users-timeline',
      dependencies: { visible: 'modes:users' }
    },
    {
      id: 'channels',
      type: 'PieData',
      title: 'Channel Usage',
      subtitle: 'Total messages sent per channel',
      size: { w: 3, h: 8 },
      source: 'ai:timeline',
      dependencies: { visible: 'modes:messages' },
      props: { showLegend: true, compact: true, entityType: 'Messages' }
    },
    {
      id: 'channels',
      type: 'PieData',
      title: 'Channel Usage (Users)',
      subtitle: 'Total users sent per channel',
      size: { w: 3, h: 8 },
      source: 'ai:users-timeline',
      dependencies: { visible: 'modes:users' },
      props: { showLegend: true, compact: true, entityType: 'Users' }
    },
    {
      id: 'scores',
      type: 'Scorecard',
      size: { w: 4, h: 3 },
      source: { errors: 'errors', sentiment: 'ai:sentiments', conversions: 'ai:conversions' },
      dependencies: {
        card_errors_tooltip: '::Total errors',
        card_errors_onClick: '::onErrorsClick',
        card_users_value: 'retention:total',
        card_users_heading: '::Users',
        card_users_icon: '::account_circle',
        card_users_subvalue: 'retention:returning',
        card_users_subheading: '::Returning',
        card_users_tooltip: '::Total users and retention',
        card_users_onClick: '::onUsersClick',
        card_sentiment_tooltip: '::Average sentiment',
        card_sentiment_onClick: '::onSentimentsClick',
        card_conversions_tooltip: '::Percentage of user interactions completed with a conversion',
      },
      actions: {
        onErrorsClick: {
          action: 'dialog:errors',
          params: {
            title: 'args:heading',
            type: 'args:type',
            innermostMessage: 'args:innermostMessage',
            queryspan: 'timespan:queryTimespan'
          }
        },
        onUsersClick: { action: 'dialog:userRetention', params: { title: 'args:heading', queryspan: '::P90D' } },
        onSentimentsClick: {
          action: 'dialog:sentimentConversations',
          params: {
            title: 'args:heading',
            queryspan: 'timespan:queryTimespan'
          }
        }
      }
    },
    {
      id: 'intents',
      type: 'BarData',
      title: 'Intents Graph',
      subtitle: 'Intents usage per time',
      size: { w: 4, h: 8 },
      source: 'ai:intents',
      actions: {
        onBarClick: {
          action: 'dialog:intentsDialog',
          params: { title: 'args:value', intent: 'args:value', queryspan: 'timespan:queryTimespan' }
        }
      }
    },
    {
      id: 'timeline-area',
      type: 'Area',
      title: 'Message Rate',
      subtitle: 'How many messages were sent per timeframe',
      size: { w: 4, h: 8 },
      source: 'ai:timeline',
      props: { isStacked: true, showLegend: false }
    },
    {
      id: 'map',
      type: 'MapData',
      title: 'Map Activity',
      subtitle: 'Monitor regional activity',
      size: { w: 4, h: 13 },
      location: { x: 9, y: 1 },
      source: 'ai:mapActivity',
      props: { mapProps: { zoom: 1, maxZoom: 6 }, searchLocations: true }
    }
  ],
  dialogs: [
    {
      id: 'intentsDialog',
      width: '70%',
      params: ['title', 'intent', 'queryspan'],
      dataSources: [
        {
          id: 'intents-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            intent: 'dialog_intentsDialog:intent',
            queryTimespan: 'dialog_intentsDialog:queryspan',
            timespan: 'timespan',
            granularity: 'timespan:granularity'
          },
          params: {
            table: 'customEvents',
            queries: {
              'intent-usage-timeline': {
                query: ({ intent, granularity }) => `
                  extend intent=(customDimensions.intent)
                  | where timestamp > ago(30d) and intent =~ '${intent}'
                  | summarize count=count() by bin(timestamp, ${granularity})
                  | order by timestamp`,
                format: { type: 'timeline', args: { timeField: 'timestamp', lineField: 'intent', valueField: 'count' } }
              },
              'entities-usage': {
                query: ({ intent }) => `
                  extend conversation=tostring(customDimensions.conversationId), 
                    entityType=tostring(customDimensions.entityType), 
                    entityValue=tostring(customDimensions.entityValue), 
                    intent=customDimensions.intent 
                  | where name=='MBFEvent.Entity' and intent =~'${intent}' 
                  | project conversation, entityType, entityValue, intent 
                  | summarize count=count() by entityType, entityValue`,
                format: {
                  type: 'bars',
                  args: { barsField: 'entityType', seriesField: 'entityValue', valueField: 'count', threshold: 10 }
                }
              },
              'total-conversations': {
                query: ({ intent }) => `
                  extend conversation=tostring(customDimensions.conversationId), intent=customDimensions.intent 
                  | where name=='MBFEvent.Intent' and intent =~ '${intent}' 
                  | summarize count_intents=count() by conversation  
                  | count`,
                format: {
                  type: 'scorecard',
                  args: {
                    countField: 'Count',
                    thresholds: [{ value: 0, color: '#2196F3', icon: 'chat', heading: 'Conversations' }]
                  }
                }
              },
              'intent-utterances': {
                query: ({ intent }) => `
                  extend conversation=tostring(customDimensions.conversationId), 
                    intent=customDimensions.intent,
                    text=substring(customDimensions.text, 0, 50) 
                  | where name=='MBFEvent.Intent' and intent =~ '${intent}' 
                  | summarize count_utterances=count(), maxTimestamp=max(timestamp) by text 
                  | order by count_utterances 
                  | top 5 by count_utterances `
              }
            }
          }
        },
        {
          id: 'intentSentiments',
          type: 'ApplicationInsights/Query',
          dependencies: { intent: 'dialog_intentsDialog:intent', queryTimespan: 'dialog_intentsDialog:queryspan' },
          params: {
            query: ({ intent }) => `
              customEvents 
              | extend intent=customDimensions.intent 
              | where name startswith 'MBFEvent.Intent' and intent =~ '${intent}' 
              | extend timestamp=tostring(customDimensions.timestamp),
                conversation=tostring(customDimensions.conversationId),
                userId=tostring(customDimensions.userId) 
              | join kind= leftouter (
                customEvents 
                | where name startswith 'MBFEvent.Sentiment' 
                | extend timestamp=tostring(customDimensions.timestamp), 
                  sentiment=todouble(customDimensions.score),
                  conversation=tostring(customDimensions.conversationId),
                  userId=tostring(customDimensions.userId)
              ) on timestamp, userId, conversation 
              | summarize count=avg(sentiment)
            `
          },
          format: {
            type: 'scorecard',
            args: {
              thresholds: [
                { value: 0, color: '#D50000', icon: 'sentiment_dissatisfied', heading: 'Sentiment' },
                { value: 40, color: '#FF9810', icon: 'sentiment_neutral', heading: 'Sentiment' },
                { value: 60, color: '#AEEA00', icon: 'sentiment_satisfied', heading: 'Sentiment' }
              ],
              subvalueThresholds: [
                { value: 0, subheading: 'Negative' },
                { value: 40, subheading: 'Neutral' },
                { value: 60, subheading: 'Positive' }
              ]
            }
          }
        }
      ],
      elements: [
        {
          id: 'entity-usage',
          type: 'BarData',
          title: 'Entity count appearances in intent',
          subtitle: 'Entity usage and count for the selected intent',
          size: { w: 6, h: 8 },
          source: 'intents-data:entities-usage'
        },
        {
          id: 'utterances',
          type: 'Table',
          size: { w: 4, h: 8 },
          dependencies: { values: 'intents-data:intent-utterances' },
          props: {
            cols: [
              { header: 'Top Utterances', width: '200px', field: 'text' },
              { header: 'Count', field: 'count_utterances', type: 'number' }
            ]
          }
        },
        {
          id: 'intent-timeline',
          type: 'Timeline',
          title: 'Message Rate',
          subtitle: 'How many messages were sent per timeframe',
          size: { w: 8, h: 8 },
          source: 'intents-data:intent-usage-timeline'
        },
        {
          id: 'conversations-count',
          type: 'Scorecard',
          size: { w: 2, h: 8 },
          source: { conversations: 'intents-data:total-conversations', sentiment: 'intentSentiments' },
          dependencies: { card_conversations_onClick: '::onConversationsClick' },
          actions: {
            onConversationsClick: {
              action: 'dialog:intentConversations',
              params: {
                title: 'dialog_intentsDialog:title',
                intent: 'dialog_intentsDialog:intent',
                queryspan: 'dialog_intentsDialog:queryspan'
              }
            }
          }
        }
      ]
    },
    {
      id: 'intentConversations',
      width: '60%',
      params: ['title', 'intent', 'queryspan'],
      dataSources: [
        {
          id: 'conversations-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            intent: 'dialog_intentConversations:intent',
            queryTimespan: 'dialog_intentConversations:queryspan'
          },
          params: {
            query: ({ intent }) => ` 
              customEvents
              | extend conversation=tostring(customDimensions.conversationId), intent=customDimensions.intent
              | where name=='MBFEvent.Intent' and intent =~ '${intent}'
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
          dependencies: { values: 'conversations-data' },
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
                intent: 'dialog_intentConversations:intent',
                queryspan: 'timespan:queryTimespan'
              }
            }
          }
        }
      ]
    },
    {
      id: 'sentimentConversations',
      width: '60%',
      params: ['title', 'queryspan'],
      dataSources: [
        {
          id: 'sentiment-conversations-data',
          type: 'ApplicationInsights/Query',
          dependencies: { queryTimespan: 'dialog_sentimentConversations:queryspan' },
          params: {
            query: () => ` 
              customEvents
              | extend conversation=tostring(customDimensions.conversationId), 
                intent=customDimensions.intent,
                timestamp=tostring(customDimensions.timestamp),
                userId=tostring(customDimensions.userId)
              | where name=='MBFEvent.Intent'
              | join kind=leftouter (
                customEvents 
                | where name startswith 'MBFEvent.Sentiment' 
                | extend timestamp=tostring(customDimensions.timestamp), 
                  sentiment=todouble(customDimensions.score),
                  conversation=tostring(customDimensions.conversationId),
                  userId=tostring(customDimensions.userId)
              ) on timestamp, userId, conversation
              | summarize count=count(), sentiment=avg(sentiment), maxTimestamp=max(timestamp) by conversation
              | extend color=iff(sentiment > 0.6, 'green', iff(sentiment < 0.4, 'red', 'yellow')), 
                icon=iff(sentiment > 0.6, 'sentiment_satisfied', 
                iff(sentiment < 0.4, 'sentiment_dissatisfied', 'sentiment_neutral'))
              | order by sentiment`,
            mappings: { id: (val, row, idx) => `Conversation ${idx}` }
          },
          calculated: ({ values }) => {
            return {
              top5Positive: _.take(values, 5),
              top5Negative: _.takeRight(values, 5)
            };
          }
        }
      ],
      elements: [
        {
          id: 'top5positive',
          type: 'Table',
          size: { w: 5, h: 8 },
          dependencies: { values: 'sentiment-conversations-data:top5Positive' },
          props: {
            compact: true,
            cols: [
              { header: 'Top 5 Positive', field: 'id' },
              { header: null, width: '10px', field: 'icon', type: 'icon', color: 'color' },
              { header: 'Last Message', field: 'maxTimestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { header: 'Count', width: '10px', field: 'count' },
              { type: 'button', width: '10px', value: 'chat', click: 'openMessagesDialog' }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: 'dialog:messages',
              params: {
                title: 'args:id',
                conversation: 'args:conversation',
                queryspan: 'timespan:queryTimespan',
                intent: '::'
              }
            }
          }
        },
        {
          id: 'top5negative',
          type: 'Table',
          size: { w: 5, h: 8 },
          dependencies: { values: 'sentiment-conversations-data:top5Negative' },
          props: {
            compact: true,
            cols: [
              { header: 'Top 5 Negative', field: 'id' },
              { header: null, width: '10px', field: 'icon', type: 'icon', color: 'color' },
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
                queryspan: 'timespan:queryTimespan',
                intent: '::'
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
    },
    {
      id: 'errors',
      width: '90%',
      params: ['title', 'queryspan'],
      dataSources: [
        {
          id: 'errors-group',
          type: 'ApplicationInsights/Query',
          dependencies: { queryTimespan: 'dialog_errors:queryspan' },
          params: {
            query: () => ` 
              exceptions
              | summarize error_count=count() by type, innermostMessage
              | project type, innermostMessage, error_count
              | order by error_count desc `
          }
        },
        {
          id: 'errors-selection',
          type: 'ApplicationInsights/Query',
          dependencies: {
            queryTimespan: 'dialog_errors:queryspan',
            type: 'args:type',
            innermostMessage: 'args:innermostMessage'
          },
          params: {
            query: ({ type, innermostMessage }) => `
              exceptions
              | where type == "${type}" 
              | where innermostMessage == "${innermostMessage}" 
              | extend conversationId=customDimensions['Conversation ID'] 
              | project type, innermostMessage, handledAt, conversationId, operation_Id `
          }
        }
      ],
      elements: [
        {
          id: 'errors-list',
          type: 'SplitPanel',
          title: 'Errors',
          size: { w: 12, h: 16 },
          dependencies: { groups: 'errors-group', values: 'errors-selection' },
          props: {
            cols: [
              { header: 'Type', field: 'type', secondaryHeader: 'Message', secondaryField: 'innermostMessage' },
              {
                header: 'Conversation Id',
                field: 'conversationId',
                secondaryHeader: 'Operation Id',
                secondaryField: 'operation_Id'
              },
              { header: 'HandledAt', field: 'handledAt' },
              { type: 'button', value: 'more', click: 'openErrorDetail' }
            ],
            group: { field: 'type', secondaryField: 'innermostMessage', countField: 'error_count' }
          },
          actions: {
            select: {
              action: 'errors-selection:updateDependencies',
              params: {
                title: 'args:type',
                type: 'args:type',
                innermostMessage: 'args:innermostMessage',
                queryspan: 'timespan:queryTimespan'
              }
            },
            openErrorDetail: {
              action: 'dialog:errordetail',
              params: {
                title: 'args:operation_Id',
                type: 'args:type',
                innermostMessage: 'args:innermostMessage',
                handledAt: 'args:handledAt',
                conversationId: 'args:conversationId',
                operation_Id: 'args:operation_Id',
                queryspan: 'timespan:queryTimespan'
              }
            }
          }
        }
      ]
    },
    {
      id: 'errordetail',
      width: '50%',
      params: ['title', 'handledAt', 'type', 'operation_Id', 'queryspan'],
      dataSources: [
        {
          id: 'errordetail-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            operation_Id: 'dialog_errordetail:operation_Id',
            queryTimespan: 'dialog_errordetail:queryspan'
          },
          params: {
            query: ({ operation_Id }) => ` 
              exceptions
              | where operation_Id == '${operation_Id}'
              | extend conversationId=customDimensions['Conversation ID']
              | project handledAt, type, innermostMessage, conversationId, operation_Id, timestamp, details `
          }
        }
      ],
      elements: [
        {
          id: 'errordetail-item',
          type: 'Detail',
          title: 'Error detail',
          size: { w: 12, h: 16 },
          dependencies: { values: 'errordetail-data' },
          props: {
            cols: [
              { header: 'Handle', field: 'handledAt' },
              { header: 'Type', field: 'type' },
              { header: 'Message', field: 'innermostMessage' },
              { header: 'Conversation ID', field: 'conversationId' },
              { header: 'Operation ID', field: 'operation_Id' },
              { header: 'Timestamp', field: 'timestamp' },
              { header: 'Details', field: 'details' }
            ]
          }
        }
      ]
    },
    {
      id: 'userRetention',
      width: '50%',
      params: ['title', 'queryspan'],
      dataSources: [
        {
          id: 'ai-ur',
          type: 'ApplicationInsights/Query',
          dependencies: {
            timespan: 'timespan',
            queryTimespan: 'timespan:queryTimespan',
            granularity: 'timespan:granularity',
            selectedChannels: 'filters:channels-values-selected',
            selectedIntents: 'filters:intents-values-selected'
          },
          params: {
            table: 'customEvents',
            queries: {
              retention_total_incoming_messages: {
                query: () => `where name == 'MBFEvent.UserMessage' | count`,
                filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
                format: { type: 'scorecard', args: { countField: 'Count' } }
              },
              retention_avg_incoming_per_user: {
                query: () => `
                  where name == 'MBFEvent.UserMessage' 
                  | extend userId=tostring(customDimensions.userId) 
                  | summarize messages=count() by userId 
                  | summarize count=avg(messages) `,
                filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
                format: { type: 'scorecard' }
              },
              retention_total_outgoing_messages: {
                query: () => `where name == 'MBFEvent.BotMessage' | count`,
                filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
                format: { type: 'scorecard', args: { countField: 'Count' } }
              },
              retention_avg_outgoing_per_user: {
                query: () => `
                  where name == 'MBFEvent.BotMessage' 
                  | extend userId=tostring(customDimensions.userId), 
                    conversation=tostring(customDimensions.conversationId) 
                  | summarize messages=count() by userId, conversation 
                  | summarize count=avg(messages) `,
                filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
                format: { type: 'scorecard' }
              },
              retention_avg_sessions_per_user: {
                query: () => `
                  where name == 'MBFEvent.UserMessage' 
                  | extend userId=tostring(customDimensions.userId), 
                    conversation=tostring(customDimensions.conversationId) 
                  | summarize messages=count() by bin(timestamp, 1h), conversation, userId 
                  | summarize sum_sessions=count() by conversation, userId 
                  | summarize count=avg(sum_sessions)`,
                filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
                format: { type: 'scorecard' }
              },
              retention_avg_messages_per_session: {
                query: () => `
                  where name == 'MBFEvent.UserMessage' 
                  | extend userId=tostring(customDimensions.userId), 
                    conversation=tostring(customDimensions.conversationId) 
                  | summarize messages=count() by bin(timestamp, 1h), conversation, userId 
                  | summarize sum_sessions=count() by conversation, userId 
                  | summarize count=avg(sum_sessions)`,
                filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }],
                format: { type: 'scorecard' }
              },
              retention_top_users: {
                query: () => `
                  where name == 'MBFEvent.UserMessage' 
                  | extend userId=substring(tostring(customDimensions.userId), 0, 30), 
                    fullUserId=tostring(customDimensions.userId) 
                  | summarize messages=count() by fullUserId, userId 
                  | top 5 by messages 
                `,
                filters: [{ dependency: 'selectedChannels', queryProperty: 'customDimensions.channel' }]
              }
            }
          }
        }
      ],
      elements: [
        {
          id: 'retention-scores',
          type: 'Scorecard',
          size: { w: 6, h: 3 },
          dependencies: {
            card_msgs_icon: '::chat',
            card_msgs_value: 'ai-ur:retention_total_incoming_messages-value',
            card_msgs_heading: '::Total Msgs',
            card_msgs_subvalue: 'ai-ur:retention_total_outgoing_messages-value',
            card_msgs_subheading: '::Outgoing',
            card_msgs_color: '::#2196F3',
            card_impu_icon: '::account_circle',
            card_impu_value: 'ai-ur:retention_avg_incoming_per_user-value',
            card_impu_heading: '::Avg msg/usr',
            card_impu_subvalue: 'ai-ur:retention_avg_outgoing_per_user-value',
            card_impu_subheading: '::Outgoing',
            card_impu_color: '::#2196F3',
            card_aspu_icon: '::account_circle',
            card_aspu_value: 'ai-ur:retention_avg_sessions_per_user-value',
            card_aspu_heading: '::Avg ssn/usr',
            card_aspu_subvalue: 'ai-ur:retention_avg_messages_per_session-value',
            card_aspu_subheading: '::Msg/Session',
            card_aspu_color: '::#2196F3'
          }
        },
        {
          id: 'user-retention-table',
          type: 'Table',
          title: 'User Retention',
          size: { w: 3, h: 9 },
          dependencies: { values: 'retention' },
          props: {
            compact: true,
            cols: [
              { header: 'Time Span', field: 'timespan' },
              { header: 'Retention', field: 'retention' },
              { header: 'Returning', field: 'returning' },
              { header: 'Unique Users', field: 'unique' }
            ]
          }
        },
        {
          id: 'top-users-table',
          type: 'Table',
          title: 'Top Users',
          size: { w: 3, h: 9 },
          dependencies: { values: 'ai-ur:retention_top_users' },
          props: {
            compact: true,
            cols: [
              { header: 'User Id', field: 'userId' },
              { header: 'Messages', field: 'messages' },
              { type: 'button', value: 'chat', click: 'openMessagesDialog' }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: 'dialog:userConversations',
              params: { title: 'args:userId', userId: 'args:fullUserId', queryspan: 'timespan:queryTimespan' }
            }
          }
        }
      ]
    },
    {
      id: 'userConversations',
      width: '60%',
      params: ['title', 'userId', 'queryspan'],
      dataSources: [
        {
          id: 'user-conversations-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            userId: 'dialog_userConversations:userId',
            queryTimespan: 'dialog_userConversations:queryspan'
          },
          params: {
            query: ({ userId }) => ` 
              customEvents
              | extend conversation=tostring(customDimensions.conversationId), userId=tostring(customDimensions.userId)
              | where name=='MBFEvent.UserMessage' and userId == '${userId}'
              | summarize count=count(), maxTimestamp=max(timestamp) by conversation
              | order by maxTimestamp`,
            mappings: { id: (val, row, idx) => `Conversation ${idx}` }
          }
        }
      ],
      elements: [
        {
          id: 'user-conversations-list',
          type: 'Table',
          title: 'Conversations',
          size: { w: 12, h: 16 },
          dependencies: { values: 'user-conversations-data' },
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
                intent: 'dialog_intentConversations:intent',
                queryspan: 'timespan:queryTimespan'
              }
            }
          }
        }
      ]
    }
  ]
};