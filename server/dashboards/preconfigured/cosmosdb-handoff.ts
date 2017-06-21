/// <reference path="../../../src/types.d.ts"/>
import * as _ from 'lodash';

// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: 'cosmosdb_handoff',
  name: 'Hand-off to human',
  icon: 'question_answer',
  url: 'cosmosdb_handoff',
  description: 'Monitor bot and hand-off to human conversations',
  preview: '/images/bot-framework-preview.png',
  html: `<div>
    <h1>Hand-off to human</h1>
    <h2>Features</h2>
    <ul>
      <li>
        <p>Displays total users including how many are talking with bot, human agent or waiting for an agent.</p>
      </li>
      <li>
        <p>Displays average time waiting (in secs) for human agent to connect and respond to user, 
          including the shortest and longest times.</p>
      </li>
      <li>
        <p>Displays total number of transcripts with bot or with human agent.</p>
      </li>
      <li>
        <p>Displays timeline of conversations with bot and human.</p>
      </li>
      <li>
        <p>Displays list of active conversations with sentiment score.</p>
        <p>If there is a conversation of interest this can be selected to show the option to hand-off to human.</p>
      </li>
    </ul>
    <p>
      <span>Refer to the </span>
      <span>
        <a href="https://github.com/CatalystCode/ibex-dashboard/blob/master/docs/bot-framework.md" target="_blank">
          bot-framework
        </a> docs for setup instructions.</span>
    </p>
  </div>`,
  config: {
    connections: {
      'bot-framework': {
        'directLine': '',
        'conversationsEndpoint': '',
        'webchatEndpoint': ''
      }
    },
    layout: {
      isDraggable: true,
      isResizable: true,
      rowHeight: 30,
      verticalCompact: false,
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
    }
  },
  filters: [
    {
      type: 'TextFilter',
      title: 'Timespan',
      dependencies: { selectedValue: 'timespan', values: 'timespan:values' },
      actions: { onChange: 'timespan:updateSelectedValue' },
      first: true
    }
  ],
  dataSources: [
    {
      id: 'timespan',
      type: 'Constant',
      params: { values: ['24 hours', '1 week', '1 month', '3 months'], selectedValue: '1 month' },
      calculated: (state, dependencies) => {
        let { selectedValue } = state;
        let queryTimespan =
          selectedValue === '24 hours' ? 'PT24H' :
            selectedValue === '1 week' ? 'P7D' :
              selectedValue === '1 month' ? 'P30D' :
                'P90D';
        let granularity =
          selectedValue === '24 hours' ? '5m' :
            selectedValue === '1 week' ? '1d' : '1d';
        return { queryTimespan, granularity };
      }
    },
    {
      id: 'ai',
      type: 'ApplicationInsights/Query',
      dependencies: {
        timespan: 'timespan',
        queryTimespan: 'timespan:queryTimespan',
        granularity: 'timespan:granularity'
      },
      params: {
        table: 'customEvents',
        queries: {
          transcripts: {
            query: () => `where name == 'Transcript'
              | extend conversationId=tostring(customDimensions.userConversationId), 
                customerName=tostring(customDimensions.customerName), 
                timestamp=todatetime(customDimensions.timestamp) 
              | project conversationId, customerName, timestamp, customDimensions
              | order by timestamp desc
              | summarize transcripts_count=count(timestamp), 
                transcripts=makelist(customDimensions) by customerName, conversationId
              | project conversationId, customerName, transcripts_count, transcripts`,
            calculated: (transcripts) => {
              const listTranscripts = transcripts.reduce((destArray, currentValue) => {
                const transcriptsArray = JSON.parse(currentValue.transcripts);
                if (!Array.isArray(transcriptsArray)) {
                  return destArray;
                }
                const lastMessage = transcriptsArray.find(x => x.from !== 'Bot');
                if (!lastMessage) {
                  return destArray;
                }
                const lastSentimentScore = parseFloat(lastMessage.sentimentScore) || 0.5;
                const lastState = parseInt(transcriptsArray[0].state);
                const value = {
                  userId: lastMessage.customerId,
                  conversationId: lastMessage.customerConversationId,
                  username: lastMessage.customerName || 'Anon',
                  timestamp: new Date(lastMessage.timestamp).toUTCString(),
                  lastMessage: lastMessage.text || '',
                  lastSentimentScore: lastSentimentScore,
                  lastSentiment: lastSentimentScore < 0 ? 'error_outline' :
                    lastSentimentScore < 0.2 ? 'sentiment_very_dissatisfied' :
                      lastSentimentScore < 0.4 ? 'sentiment_dissatisfied' :
                        lastSentimentScore < 0.6 ? 'sentiment_neutral' :
                          lastSentimentScore < 0.8 ? 'sentiment_satisfied' : 'sentiment_very_satisfied',
                  icon: lastState === 0 ? 'memory' :  
                    lastState === 2 ? 'perm_identity' : 'more_horiz',
                };
                destArray.push(value);
                return destArray;
              }, []);
              return {
                'transcripts-values': listTranscripts
              };
            }
          },

          transcriptsTimeWaiting: {
            query: () => `where name == 'Transcript'
              | extend conversationId=tostring(customDimensions.userConversationId), 
                customerId=tostring(customDimensions.customerId), 
                state=toint(customDimensions.state)  
              | where state==1 or state==2
              | order by timestamp asc
              | summarize total=count(), times=makelist(timestamp) by conversationId, customerId, bin(state, 1)
              | project conversationId, customerId, state, startTime=times[0] 
              | summarize result=count(state), startEndTimes=makelist(startTime) by conversationId, customerId
              | where result == 2
              | project conversationId, customerId, timeTaken=todatetime(startEndTimes[1])-todatetime(startEndTimes[0])`,
            calculated: (results) => {
              const times = results.reduce((acc, cur) => {
                // converts time hh:mm:ss format to value in seconds
                acc.push(cur.timeTaken.split(':').reverse().reduce((a, c, i) => a + c * Math.pow(60, i), 0));
                return acc;
              }, []);
              const avgTimeWaiting = times.reduce((a, c) => a + c, 0) / times.length;
              const maxTimeWaiting = Math.max(...times);
              const minTimeWaiting = Math.min(...times);
              const timeFormat = (secs) => {
                const time = new Date(secs * 1000);
                let t = time.getSeconds() + 's';
                if (time.getHours() > 0 && time.getMinutes() > 0) {
                  t = time.getHours() + 'h ' + time.getMinutes() + 'm';
                } else if (time.getMinutes() > 0) {
                  t = time.getMinutes() + 'm';
                }
                return t;
              };
              return {
                'transcriptsAverageTimeWaiting-value': isFinite(avgTimeWaiting) ? timeFormat(avgTimeWaiting) : '-',
                'transcriptsLongestTimeWaiting-value': isFinite(avgTimeWaiting) ? timeFormat(maxTimeWaiting) : '-',
                'transcriptsShortestTimeWaiting-value': isFinite(avgTimeWaiting) ? timeFormat(minTimeWaiting) : '-',
              };
            }
          },

          transcriptsTimeline: {
            query: (dependencies) => {
              var { granularity } = dependencies;
              return `where name == 'Transcript' 
                | extend customerName=tostring(customDimensions.customerName), 
                  text=tostring(customDimensions.text), 
                  state=toint(customDimensions.state), 
                  agentName=tostring(customDimensions.agentName), 
                  from=tostring(customDimensions.from) 
                | extend timestamp=todatetime(customDimensions.timestamp) 
                | extend states=pack_array('bot','waiting','agent','watching')
                | extend stateLabel=tostring(states[state])
                | where state == 0 or state == 2
                | project timestamp, from, text, customerName, agentName, state, stateLabel 
                | summarize transcripts_count=count() 
                  by bin(timestamp, ${granularity}), state, stateLabel 
                | order by timestamp asc`;
            },
            calculated: (results, dependencies) => {
              const totalBot = results.reduce((a, c) => c.state === 0 ? a + c.transcripts_count : a, 0);
              const totalAgent = results.reduce((a, c) => c.state === 2 ? a + c.transcripts_count : a, 0);
              const totalMessages = totalBot + totalAgent;
              // Timeline 
              const { timespan } = dependencies;
              const keys = [...new Set(results.reduce((a, c) => { a.push(c.stateLabel); return a; }, []))];
              const timestampKey = 'time'; // NB: required key name for timeline component
              // group by timestamp
              const graphData = results.reduce((a, c) => {
                if (!c.timestamp) {
                  console.warn('Invalid date format:', c);
                  return a;
                }
                const item = a.find(collection => collection[timestampKey] === c.timestamp);
                if (!item) {
                  // new time collection
                  let collection = {
                    count: 0
                  };
                  collection[timestampKey] = c.timestamp;
                  keys.forEach(key => {
                    collection[key] = (key !== c.stateLabel) ? 0 : c.transcripts_count;
                  });
                  a.push(collection);
                } else {
                  // merge into time collection
                  item.count += c.transcripts_count;
                  item[c.stateLabel] += c.transcripts_count;
                }
                return a;
              }, []);
              return {
                'timeline-graphData': graphData,
                'timeline-recipients': keys,
                'timeline-timeFormat': (timespan === '24 hours' ? 'hour' : 'date'),
                'transcriptsBot-value': totalBot,
                'transcriptsAgent-value': totalAgent,
                'transcriptsTotal-value': totalMessages,
              };
            }
          },

          customerTranscripts: {
            query: () => `where name == 'Transcript'
              | summarize 
                maxState=max(toint(customDimensions.state)) 
                by customerConversationId=tostring(customDimensions.userConversationId), 
                customerName=tostring(customDimensions.customerName)`,
            calculated: (customerTranscripts) => {
              const bot = customerTranscripts.filter((e) => e.maxState === 0);
              const waiting = customerTranscripts.filter((e) => e.maxState === 1);
              const agent = customerTranscripts.filter((e) => e.maxState === 2);
              return {
                'customerTotal-value': customerTranscripts.length,
                'customerBot-value': bot.length,
                'customerWaiting-value': waiting.length,
                'customerAgent-value': agent.length,
              };
            }
          }

        }
      }
    }
  ],
  elements: [
    {
      id: 'customerTotal',
      type: 'Scorecard',
      title: 'Users',
      size: { w: 6, h: 3 },
      dependencies: {
        card_total_heading: '::Total Users',
        card_total_value: 'ai:customerTotal-value',
        card_total_color: '::#666666',
        card_total_icon: '::account_circle',
        card_bot_heading: '::Bot',
        card_bot_value: 'ai:customerBot-value',
        card_bot_color: '::#00FF00',
        card_bot_icon: '::memory',
        card_agent_heading: '::Agent',
        card_agent_value: 'ai:customerAgent-value',
        card_agent_color: '::#0066FF',
        card_agent_icon: '::perm_identity',
        card_waiting_heading: '::Waiting',
        card_waiting_value: 'ai:customerWaiting-value',
        card_waiting_color: '::#FF6600',
        card_waiting_icon: '::more_horiz',
      }
    },

    {
      id: 'customerWaiting',
      type: 'Scorecard',
      title: 'Waiting Times',
      size: { w: 6, h: 3 },
      dependencies: {
        card_average_heading: '::Average',
        card_average_value: 'ai:transcriptsAverageTimeWaiting-value',
        card_average_color: '::#333333',
        card_average_icon: '::av_timer',
        card_max_heading: '::Longest',
        card_max_value: 'ai:transcriptsLongestTimeWaiting-value',
        card_max_color: '::#ff0000',
        card_max_icon: '::timer',
        card_min_heading: '::Shortest',
        card_min_value: 'ai:transcriptsShortestTimeWaiting-value',
        card_min_color: '::#0066ff',
        card_min_icon: '::timer',
      }
    },

    {
      id: 'transcriptsTotal',
      type: 'Scorecard',
      title: 'Transcripts',
      size: { w: 2, h: 8 },
      dependencies: {
        card_total_heading: '::Total Msgs',
        card_total_value: 'ai:transcriptsTotal-value',
        card_total_color: '::#666666',
        card_total_icon: '::question_answer',
        card_bot_heading: '::Bot',
        card_bot_value: 'ai:transcriptsBot-value',
        card_bot_color: '::#00FF00',
        card_bot_icon: '::memory',
        card_agent_heading: '::Agent',
        card_agent_value: 'ai:transcriptsAgent-value',
        card_agent_color: '::#0066FF',
        card_agent_icon: '::perm_identity'
      }
    },

    {
      id: 'timelineHandoffConversations',
      type: 'Area',
      title: 'Conversations with bot / human',
      subtitle: 'How many conversations required hand-off to human',
      size: { w: 10, h: 8 },
      dependencies: {
        values: 'ai:timeline-graphData',
        lines: 'ai:timeline-recipients',
        timeFormat: 'ai:timeline-timeFormat'
      },
      props: {
        isStacked: false,
        showLegend: true
      }
    },

    {
      id: 'conversations',
      type: 'Table',
      title: 'Recent Conversations',
      subtitle: 'Monitor bot communications',
      size: { w: 12, h: 19 },
      dependencies: { values: 'ai:transcripts-values' },
      props: {
        cols: [
          { header: 'Timestamp', field: 'timestamp', type: 'time', format: 'MMM-DD HH:mm:ss', width: '100px' },
          { header: 'Last Message', field: 'lastMessage' },
          { header: 'Last Sentiment', field: 'lastSentiment', type: 'icon', tooltip: 'lastSentimentScore', tooltipPosition: 'right' },
          { header: 'Username', field: 'username' },
          { header: 'Status', field: 'icon', type: 'icon' },
          { type: 'button', value: 'chat', click: 'openTranscriptsDialog' }
        ]
      },
      actions: {
        openTranscriptsDialog: {
          action: 'dialog:transcriptsDialog',
          params: { title: 'args:username', conversationId: 'args:conversationId', queryspan: 'timespan:queryTimespan' }
        }
      }
    }

  ],
  dialogs: [
    {
      id: 'transcriptsDialog',
      width: '60%',
      params: ['title', 'conversationId', 'queryspan'],
      dataSources: [
        {
          id: 'transcripts-data',
          type: 'ApplicationInsights/Query',
          dependencies: {
            username: 'dialog_transcriptsDialog:title',
            conversationId: 'dialog_transcriptsDialog:conversationId',
            queryTimespan: 'dialog_transcriptsDialog:queryspan',
            secret: 'connection:bot-framework.directLine'
          },
          params: {
            table: 'customEvents',
            queries: {
              'userConversationTranscripts':
              {
                query: ({ conversationId }) => {
                  return `where name == 'Transcript' 
                    | where customDimensions.customerConversationId == '${conversationId}'
                    | extend timestamp=tostring(customDimensions.timestamp)
                    | project timestamp, 
                      text=tostring(customDimensions.text), 
                      sentimentScore=todouble(customDimensions.sentimentScore), 
                      from=tostring(customDimensions.from),
                      state=toint(customDimensions.state)
                    | order by timestamp asc`; },
                calculated: (transcripts, dependencies) => {
                  if (!transcripts || transcripts.length < 1) {
                    return null;
                  }

                  const { secret } = dependencies;
                  const { conversationId } = dependencies;

                  let values = transcripts || [];
                  let body, headers = {};
                  let disabled = transcripts[transcripts.length - 1].state !== 0 ? true : false;

                  values.map(v => {
                    const lastSentimentScore = v.sentimentScore || 0.5;
                    v['sentiment'] = lastSentimentScore < 0 ? 'error_outline' :
                      lastSentimentScore < 0.2 ? 'sentiment_very_dissatisfied' :
                        lastSentimentScore < 0.4 ? 'sentiment_dissatisfied' :
                          lastSentimentScore < 0.6 ? 'sentiment_neutral' :
                            lastSentimentScore < 0.8 ? 'sentiment_satisfied' : 'sentiment_very_satisfied';
                  });

                  body = {
                    'conversationId': conversationId,
                  };
                  headers = {
                    'Authorization': `Bearer ${secret}`
                  };
                  return { 'values': values, 'headers': headers, 'body': body, 'disabled': disabled };
                }

              }
            }
          }
        }
      ],
      elements: [
        {
          id: 'transcripts-button',
          type: 'RequestButton',
          title: 'Transfer to Agent',
          size: { w: 2, h: 1 },
          location: { x: 0, y: 0 },
          dependencies: {
            body: 'transcripts-data:body',
            headers: 'transcripts-data:headers',
            disabled: 'transcripts-data:disabled',
            conversationsEndpoint: 'connection:bot-framework.conversationsEndpoint'
          },
          props: {
            url: ({ conversationsEndpoint }) => `${conversationsEndpoint}`,
            method: 'POST',
            disableAfterFirstClick: true,
            icon: 'person',
            buttonProps: { iconBefore: false, primary: true }
          }
        },
        {
          id: 'agent-button',
          type: 'RequestButton',
          title: 'Open Webchat',
          size: { w: 2, h: 1 },
          location: { x: 2, y: 0 },
          dependencies: {
            token: 'connection:bot-framework.directLine',
            webchatEndpoint: 'connection:bot-framework.webchatEndpoint',
            dependsOn: 'transcripts-data:disabled'
          },
          props: {
            url: ({ token, webchatEndpoint }) => `${webchatEndpoint}/?s=${token}`,
            link: true,
            icon: 'open_in_new',
            buttonProps: { iconBefore: false, secondary: true }
          }
        },
        {
          id: 'transcripts-list',
          type: 'Table',
          title: 'Transcripts',
          size: { w: 12, h: 11 },
          location: { x: 0, y: 1 },
          dependencies: { values: 'transcripts-data:values' },
          props: {
            rowClassNameField: 'from',
            cols: [
              { header: 'Timestamp', field: 'timestamp', type: 'time', format: 'MMM-DD HH:mm:ss', width: '50px' },
              { header: 'Sentiment', field: 'sentiment', tooltip: 'sentimentScore', type: 'icon', width: '50px', tooltipPosition: 'right' },
              { header: 'Text', field: 'text' }
            ]
          }
        }
      ]
    }

  ]
};