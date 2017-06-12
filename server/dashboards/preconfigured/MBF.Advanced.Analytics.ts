/// <reference path="../../../src/types.d.ts"/>
import * as _ from 'lodash';

// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: "mbf_advanced_analytics",
  name: "MBF Advanced Analytics",
  icon: "equalizer",
  url: "mbf_advanced_analytics",
  description: "Bot Framework Advanced Analytics Dashboard",
  preview: "/images/bot-framework-preview.png",
  html: ``,
  config: {
    connections: { },
    layout: {
      isDraggable: true,
      isResizable: true,
      rowHeight: 30,
      verticalCompact: false,
      cols: { lg: 12,md: 10,sm: 6,xs: 4,xxs: 2 },
      breakpoints: { lg: 1200,md: 996,sm: 768,xs: 480,xxs: 0 }
    }
  },
  dataSources: [
    {
      id: "timespan",
      type: "Constant",
      params: { values: ["24 hours","1 week","1 month","3 months"],selectedValue: "1 month" },
      calculated: (state, dependencies) => {
        var queryTimespan =
          state.selectedValue === '24 hours' ? 'PT24H' :
          state.selectedValue === '1 week' ? 'P7D' :
          state.selectedValue === '1 month' ? 'P30D' :
          'P90D';
        var granularity =
          state.selectedValue === '24 hours' ? '5m' :
          state.selectedValue === '1 week' ? '1d' : '1d';

        return { queryTimespan, granularity };
      }
    },
    {
      id: "modes",
      type: "Constant",
      params: { values: ["messages","users"],selectedValue: "messages" },
      calculated: (state, dependencies) => {
        let flags = {};
        flags['messages'] = (state.selectedValue === 'messages');
        flags['users']     = (state.selectedValue !== 'messages');
        return flags;
      }
    },
    {
      id: "filters",
      type: "ApplicationInsights/Query",
      dependencies: { timespan: "timespan",queryTimespan: "timespan:queryTimespan",granularity: "timespan:granularity" },
      params: {
        table: "telemetry_import_2_CL",
        queries: {
          filterChannels: {
            query: () => `
                where recordType == 'intent' |
                extend channel=channelId |
                summarize channel_count=count() by tostring(channel) |
                order by channel_count
              `,
            mappings: { channel: (val) => val || "unknown",channel_count: (val) => val || 0 },
            calculated: (filterChannels) => {
              const filters = filterChannels.map((x) => x.channel);
              let { selectedValues } = filterChannels;
              if (selectedValues === undefined) {
                selectedValues = [];
              }
              return {
                "channels-count": filterChannels,
                "channels-filters": filters,
                "channels-selected": selectedValues,
              };
            }
          },
          filterIntents: {
            query: () => `
              where recordType == "intent" |
              summarize intent_count=count() by intentName |
              extend intent=intentName |
              order by intent_count
              `,
            mappings: { intent: (val) => val || "unknown",intent_count: (val) => val || 0 },
            calculated: (filterIntents) => {
              const intents = filterIntents.map((x) => x.intent);
              let { selectedValues } = filterIntents;
              if (selectedValues === undefined) {
                selectedValues = [];
              }
              return {
                "intents-count": filterIntents,
                "intents-filters": intents,
                "intents-selected": selectedValues,
              };
            }
          }
        }
      }
    },
    {
      id: "nfl",
      type: "ApplicationInsights/Query",
      dependencies: {
        timespan: "timespan",
        queryTimespan: "timespan:queryTimespan",
        granularity: "timespan:granularity",
        selectedChannels: "filters:channels-selected",
        selectedIntents: "filters:intents-selected"
      },
      params: {
        table: "telemetry_import_2_CL",
        queries: {
          queries_per_session: {
            query: () => `
                where recordType == "intent" |
                summarize count_queries=count() by bin(timestamp, 1d), userId |
                summarize average=avg(count_queries), count_sessions=count(timestamp)  |
                extend average=round(average, 1), count_sessions `,
            calculated: (result) => {
              return {
                avg_queries_per_session: (result && result.length && result[0].average) || 0,
                total_sessions: (result && result.length && result[0].count_sessions) || 0
              }
            }
          },
          total_users: {
            query: () => `
              where recordType == 'intent' |
              summarize dcount(userId) by userId |
              count`,
            calculated: (total_users) => {
              return {
                total_users: (total_users.length && total_users[0].Count) || 0
              }
            }
          },
          returning_users: {
            query: (dependencies) => {
              let { timespan } = dependencies;
              let threshold =
                timespan === '24 hours' ? '24h' :
                timespan === '1 week' ? '7d' :
                timespan === '1 month' ? '30d' : '90d';
              return `
                where recordType == 'intent' and timestamp > ago(90d) |
                extend userId=substring(userId, 0, 1) |
                summarize dcount(userId), minTimestamp=min(timestamp), maxTimestamp=max(timestamp) by userId |
                where minTimestamp < ago(7d) and maxTimestamp > ago(7d) |
                count`;
            },
            calculated: (returning_users) => {
              return {
                returning_users: (returning_users.length && returning_users[0].Count) || 0
              }
            }
          },
          timeline: {
            query: (dependencies) => {
              var { granularity } = dependencies;
              return `
                where recordType == 'intent' |
                extend channel=channelId |
                summarize count=count() by bin(timestamp, 1d), channel |
                order by timestamp asc`;
            },
            filters: [{ dependency: "selectedChannels", queryProperty: "channelId" }],
            calculated: (timeline, dependencies) => {

              // Timeline handling
              // =================

              let _timeline = {};
              let _channels = {};
              let { timespan } = dependencies;

              /**
               * Looping through all results building timeline format values
               * Expected result:
               * {
               *   timestampValue1: { channel1: count, channel2: count ... }
               *   timestampValue2: { channel1: count2, channel2: count2 ... }
               * }
               *
               * Channels result:
               * { channel1_total: count, channel2_total: count ... }
               */
              timeline.forEach(row => {
                var { channel, timestamp, count } = row;
                var timeValue = (new Date(timestamp)).getTime();

                if (!_timeline[timeValue]) _timeline[timeValue] = {
                  time: (new Date(timestamp)).toUTCString()
                };
                if (!_channels[channel]) _channels[channel] = {
                  name: channel,
                  value: 0
                };

                _timeline[timeValue][channel] = count;
                _channels[channel].value += count;
              });

              // Going over all the channels making sure that we add "0" count
              // For every timestamp on the timeline (for no value channels)
              var channels = Object.keys(_channels);
              var channelUsage = _.values(_channels);
              var timelineValues = _.map(_timeline, value => {
                channels.forEach(channel => {
                  if (!value[channel]) value[channel] = 0;
                });
                return value;
              });

              return {
                "timeline-graphData": timelineValues,
                "timeline-channelUsage": channelUsage,
                "timeline-timeFormat": (timespan === "24 hours" ? 'hour' : 'date'),
                "timeline-channels": channels
              };
            }
          },
          "timeline-users": {
            query: (dependencies) => {
              var { granularity } = dependencies;
              return `
                where recordType == 'intent' |
                extend userId=substring(userId, 0, 1) |
                summarize count=dcount(userId) by bin(timestamp, 1d), channel=channelId |
                order by timestamp asc`;
            },
            calculated: (timeline, dependencies) => {

              // Timeline handling
              // =================

              let _timeline = {};
              let _channels = {};
              let { timespan } = dependencies;

              /**
               * Looping through all results building timeline format values
               * Expected result:
               * {
               *   timestampValue1: { channel1: count, channel2: count ... }
               *   timestampValue2: { channel1: count2, channel2: count2 ... }
               * }
               *
               * Channels result:
               * { channel1_total: count, channel2_total: count ... }
               */
              timeline.forEach(row => {
                var { channel, timestamp, count } = row;
                var timeValue = (new Date(timestamp)).getTime();

                if (!_timeline[timeValue]) _timeline[timeValue] = {
                  time: (new Date(timestamp)).toUTCString()
                };
                if (!_channels[channel]) _channels[channel] = {
                  name: channel,
                  value: 0
                };

                _timeline[timeValue][channel] = count;
                _channels[channel].value += count;
              });

              // Going over all the channels making sure that we add "0" count
              // For every timestamp on the timeline (for no value channels)
              var channels = Object.keys(_channels);
              var channelUsage = _.values(_channels);
              var timelineValues = _.map(_timeline, value => {
                channels.forEach(channel => {
                  if (!value[channel]) value[channel] = 0;
                });
                return value;
              });

              return {
                "timeline-users-graphData": timelineValues,
                "timeline-users-channelUsage": channelUsage,
                "timeline-users-timeFormat": (timespan === "24 hours" ? 'hour' : 'date'),
                "timeline-users-channels": channels
              };
            }
          },
          intents: {
            query: () => `
                where recordType == "intent" |
                summarize count_intents=count() by intentName |
                extend intent=substring(intentName, 0, 4) |
                order by intent `,
            filters: [{ dependency: "selectedIntents", queryProperty: "intentName" }],
            calculated: (intents) => {
              return {
                "intents-bars": [ 'count_intents' ]
              };
            }
          }
        }
      }
    },
    {
      id: "errors",
      type: "ApplicationInsights/Query",
      dependencies: { timespan: "timespan",queryTimespan: "timespan:queryTimespan" },
      params: {
        query: () => `
            exceptions
            | summarize count_error=count() by type, innermostMessage
            | order by count_error desc `
      },
      calculated: (state) => {
        var { values } = state;

        if (!values || !values.length) { return; }

        var errors = values;
        var types = {};
        var typesTotal = 0;
        errors.forEach(error => {
          if (!types[error.type]) types[error.type] = {
            name: error.type,
            count: 0
          };
          types[error.type].count += error.count_error;
          typesTotal += error.count_error;
        });

        return {
          errors,
          types: _.values(types),
          typesTotal,
          typesTotal_color: typesTotal > 0 ? '#D50000' : '#AEEA00',
          typesTotal_icon: typesTotal > 0 ? 'bug_report' : 'done'
        };
      }
    }
  ],
  filters: [
    {
      type: "TextFilter",
      dependencies: { selectedValue: "timespan",values: "timespan:values" },
      actions: { onChange: "timespan:updateSelectedValue" },
      first: true
    },
    {
      type: "TextFilter",
      dependencies: { selectedValue: "modes",values: "modes:values" },
      actions: { onChange: "modes:updateSelectedValue" },
      first: true
    },
    {
      type: "MenuFilter",
      title: "Channels",
      subtitle: "Select channels",
      icon: "forum",
      dependencies: { selectedValues: "filters:channels-selected",values: "filters:channels-filters" },
      actions: { onChange: "filters:updateSelectedValues:channels-selected" },
      first: true
    },
    {
      type: "MenuFilter",
      title: "Intents",
      subtitle: "Select intents",
      icon: "textsms",
      dependencies: { selectedValues: "filters:intents-selected",values: "filters:intents-filters" },
      actions: { onChange: "filters:updateSelectedValues:intents-selected" },
      first: true
    }
  ],
  elements: [
    {
      id: "timeline",
      type: "Timeline",
      title: "Message Rate",
      subtitle: "How many messages were sent per timeframe",
      size: { w: 6,h: 8 },
      dependencies: {
        visible: "modes:messages",
        values: "nfl:timeline-graphData",
        lines: "nfl:timeline-channels",
        timeFormat: "nfl:timeline-timeFormat"
      }
    },
    {
      id: "timeline",
      type: "Timeline",
      title: "Users Rate",
      subtitle: "How many users were sent per timeframe",
      size: { w: 6,h: 8 },
      dependencies: {
        visible: "modes:users",
        values: "nfl:timeline-users-graphData",
        lines: "nfl:timeline-users-channels",
        timeFormat: "nfl:timeline-users-timeFormat"
      }
    },
    {
      id: "channels",
      type: "PieData",
      title: "Channel Usage",
      subtitle: "Total messages sent per channel",
      size: { w: 3,h: 8 },
      dependencies: { visible: "modes:messages",values: "nfl:timeline-channelUsage" },
      props: { showLegend: false,compact: true, entityType: 'messages' }
    },
    {
      id: "channels",
      type: "PieData",
      title: "Channel Usage (Users)",
      subtitle: "Total users sent per channel",
      size: { w: 3,h: 8 },
      dependencies: { visible: "modes:users",values: "nfl:timeline-users-channelUsage" },
      props: { showLegend: false,compact: true, entityType: 'users' }
    },
    {
      id: "scores",
      type: "Scorecard",
      size: { w: 3,h: 8 },
      dependencies: {
        card_errors_value: "errors:typesTotal",
        card_errors_heading: "::Errors",
        card_errors_color: "errors:typesTotal_color",
        card_errors_icon: "errors:typesTotal_icon",
        card_errors_subvalue: "errors:typesTotal",
        card_errors_subheading: "::Avg",
        card_errors_onClick: "::onErrorsClick",
        card_qps_value: "nfl:avg_queries_per_session",
        card_qps_heading: "::Q/Session",
        card_qps_color: "::#2196F3",
        card_qps_icon: "::av_timer",
        card_qps_subvalue: "nfl:total_sessions",
        card_qps_subheading: "::Sessions",
        card_users_value: "nfl:total_users",
        card_users_heading: "::Unique Users",
        card_users_subvalue: "nfl:returning_users",
        card_users_subheading: "::Returning",
        card_users_icon: "::account_circle"
      },
      actions: {
        onErrorsClick: {
          action: "dialog:errors",
          params: { title: "args:heading",type: "args:type",innermostMessage: "args:innermostMessage",queryspan: "timespan:queryTimespan" }
        }
      }
    },
    {
      id: "intents",
      type: "BarData",
      title: "Intents Graph",
      subtitle: "Intents usage per time",
      size: { w: 6,h: 8 },
      dependencies: { values: "nfl:intents",bars: "nfl:intents-bars" },
      props: { nameKey: "intent",showLegend: false },
      actions: {
        onBarClick: {
          action: "dialog:intentsDialog",
          params: { title: "args:intentName",intent: "args:intentName",queryspan: "timespan:queryTimespan" }
        }
      }
    }
  ],
  dialogs: [
    {
      id: "intentsDialog",
      width: "80%",
      params: ["title","intent","queryspan"],
      dataSources: [
        {
          id: "intentsDialog-data",
          type: "ApplicationInsights/Query",
          dependencies: { intent: "dialog_intentsDialog:intent",queryTimespan: "dialog_intentsDialog:queryspan" },
          params: {
            table: "telemetry_import_2_CL",
            queries: {
              "total-conversations": {
                query: ({ intent }) => `
                    where recordType == "intent" and intentName == 'Hello' |
                    summarize count_intents=count() by conversationId |
                    count `,
                calculated: (results) => {
                  return {
                    "total-conversations": (results && results.length && results[0].Count) || 0
                  }
                }
              },
              intent_utterances: {
                query: ({ intent }) => `
                    where recordType == "intent" and intentName == '${intent}' |
                    summarize count_utterances=count(), maxTimestamp=max(timestamp) by intentText |
                    order by count_utterances |
                    top 5 by count_utterances `,
                calculated: (utterances) => {
                  return {
                    "sample-utterances": [
                      {
                        intentName: 'Bla',
                        utterance: "What was BLA doing with BLA in BLA?",
                        count: 7
                      },
                      {
                        intentName: 'Bla',
                        utterance: "What was Kiki doing with Kuku in Koko?",
                        count: 4
                      },
                      {
                        intentName: 'Bla',
                        utterance: "What should K do with K in K?",
                        count: 4
                      },
                      {
                        intentName: 'Bla',
                        utterance: "K@K-K",
                        count: 2
                      },
                      {
                        intentName: 'Bla',
                        utterance: "Does K and K work with K?",
                        count: 1
                      }
                    ],
                    "sample-success-rate": [
                      {
                        type: "Success",
                        percentage: "75%"
                      },
                      {
                        type: "Failure",
                        percentage: "10%"
                      },
                      {
                        type: "Ambiguous",
                        percentage: "15%"
                      }
                    ]
                  };
                }
              },
              "entities-usage": {
                query: ({ intent }) => `
                    where recordType == "entity" |
                    summarize entity_count=count() by entityType, conversationId |
                    summarize total_count=count() by entity_count, entityType |
                    order by entityType, entity_count asc |
                    where total_count <= 5 and entityType !startswith "kindNameValue"`,
                calculated: (entityUsage) => {

                  let count_values = _.uniq(entityUsage.map(e => e.total_count));
                  let barResults = {};

                  let results = entityUsage.forEach(entity => {
                    barResults[entity.entityType] = barResults[entity.entityType] || { entityType: entity.entityType };
                    barResults[entity.entityType][entity.total_count] = entity.entity_count;
                  });

                  return {
                    "entities-usage": _.values(barResults),
                    "entities-usage-bars": count_values
                  };
                }
              },
              response_times: {
                query: () => `
                  where recordType == "response" |
                  extend response=-responseMilliseconds  |
                  summarize sum0=sumif(response, response <= 1000), count0=countif(response <= 1000),
                            sum1=sumif(response, 1000 < response and response <= 2000), count1=countif(1000 < response and response <= 2000),
                            sum2=sumif(response, 2000 < response and response <= 3000), count2=countif(2000 < response and response <= 3000),
                            sum3=sumif(response, response > 3000), count3=countif(response > 3000) |
                  project avg0=sum0/count0, avg1=sum1/count1, avg2=sum2/count2, avg3=sum3/count3`
              },
              intent_quality: {
                query: () => `
                  where recordType == "response" |
                  summarize count_quality=count() by responseResult`
              },
              intent_cache_hits: {
                query: () => `
                  where recordType == "response" |
                  summarize count_hits=count() by responseCacheHit `
              },
              intent_disposition: {
                query: () => `
                  where recordType == "response" |
                  summarize count_success=count() by serviceResultSuccess  `
              }
            }
          },
          calculated: (state) => {
            let {intent_quality, intent_cache_hits, intent_disposition, response_times} = state;

            // Disposition
            let _disposition = {
              success: (_.find(intent_disposition, { serviceResultSuccess: true }) || {})['count_success'] || 0,
              fail: (_.find(intent_disposition, { serviceResultSuccess: false }) || {})['count_success'] || 0
            };
            let disposition = {
              success: Math.round(100 * _disposition.success / ((_disposition.success + _disposition.fail) || 1)),
              fail: Math.round(100 * _disposition.fail / ((_disposition.success + _disposition.fail) || 1))
            };

            // Quality
            let _quality = {
              default: (_.find(intent_quality, { responseResult: 'default' }) || {})['count_quality'] || 0,
              ambiguous: (_.find(intent_quality, { responseResult: 'ambiguous' }) || {})['count_quality'] || 0,
              normal: (_.find(intent_quality, { responseResult: 'normal' }) || {})['count_quality'] || 0,
            };

            let quality = {
              default: Math.round(100 * _quality.default / ((_quality.default + _quality.ambiguous + _quality.normal) || 1)),
              ambiguous: Math.round(100 * _quality.ambiguous / ((_quality.default + _quality.ambiguous + _quality.normal) || 1)),
              normal: Math.round(100 * _quality.normal / ((_quality.default + _quality.ambiguous + _quality.normal) || 1))
            };

            // Cache
            let _cache = {
              hits: (_.find(intent_cache_hits, { responseCacheHit: true }) || {})['count_hits'] || 0,
              misses: (_.find(intent_cache_hits, { responseCacheHit: false }) || {})['count_hits'] || 0
            };
            let cache = {
              hits: Math.round(100 * _cache.hits / ((_cache.hits + _cache.misses) || 1)),
              misses: Math.round(100 * _cache.misses / ((_cache.hits + _cache.misses) || 1))
            };

            // Response times
            let times = (response_times && response_times.length && response_times[0]) || {};

            return {
              "sample-response-types": [
                { name: "Disposition", success: disposition.success, fail: disposition.fail },
                { name: "Quality", default: quality.default, ambiguous: quality.ambiguous, normal: quality.normal },
                { name: "Type", card: 80, bubble: 20 },
                { name: "Image", success: 80, fail: 20 },
                { name: "Requests", "Logged In": 44, "Anonymous": 56 },
                { name: "Cache", hits: cache.hits, misses: cache.misses }
              ],
              "response-types-bars": [
                { name: "success", color: "#00BFA5"}, { name: "fail", color: "#B71C1C" } ,
                { name: "default", color: "#64FFDA" }, { name: "ambiguous", color: "#1DE9B6" }, { name: "normal", color: "#00BFA5" },
                { name: "card", color: "#64FFDA" }, { name: "bubble", color: "#1DE9B6" },
                { name: "Logged In", color: "#00BFA5" }, { name: "Anonymous", color: "#B71C1C" },
                { name: "hits", color: "#00BFA5" }, { name: "misses", color: "#B71C1C" }
              ],
              "response-times_0": times.avg0 || 0,
              "response-times_1": times.avg1 || 0,
              "response-times_2": times.avg2 || 0,
              "response-times_3": times.avg3 || 0
            }
          }
        }
      ],
      elements: [
        {
          id: "conversations-count",
          type: "Scorecard",
          size: { w: 12,h: 2 },
          dependencies: {
            card_conversations_value: "intentsDialog-data:total-conversations",
            card_conversations_heading: "::Conversations",
            card_conversations_color: "::#2196F3",
            card_conversations_icon: "::chat",
            card_conversations_onClick: "::onConversationsClick",
            card_responseTimes0_value: "intentsDialog-data:response-times_0",
            card_responseTimes0_heading: "::In <1 sec",
            card_responseTimes0_color: "::#03A9F4",
            card_responseTimes0_icon: "::av_timer",
            card_responseTimes1_value: "intentsDialog-data:response-times_1",
            card_responseTimes1_heading: "::In <2 sec",
            card_responseTimes1_color: "::#FFC107",
            card_responseTimes1_icon: "::av_timer",
            card_responseTimes2_value: "intentsDialog-data:response-times_2",
            card_responseTimes2_heading: "::In < 3 sec",
            card_responseTimes2_color: "::#FF5722",
            card_responseTimes2_icon: "::av_timer",
            card_responseTimes3_value: "intentsDialog-data:response-times_3",
            card_responseTimes3_heading: "::In 3+ sec",
            card_responseTimes3_color: "::#D50000",
            card_responseTimes3_icon: "::av_timer"
          },
          actions: {
            onConversationsClick: {
              action: "dialog:conversations",
              params: { title: "dialog_intentsDialog:title",intent: "dialog_intentsDialog:intent",queryspan: "dialog_intentsDialog:queryspan" }
            }
          }
        },
        {
          id: "entity-usage",
          type: "BarData",
          title: "Entity count appearances in intent",
          subtitle: "Entity usage and count for the selected intent",
          size: { w: 4,h: 8 },
          dependencies: { values: "intentsDialog-data:entities-usage",bars: "intentsDialog-data:entities-usage-bars" },
          props: { nameKey: "entityType" }
        },
        {
          id: "response-statistics",
          type: "BarData",
          title: "Response Statistics",
          subtitle: "Entity usage and count for the selected intent",
          size: { w: 4,h: 8 },
          dependencies: { values: "intentsDialog-data:sample-response-types",bars: "intentsDialog-data:response-types-bars" },
          props: { nameKey: "name" }
        },
        {
          id: "utterances",
          type: "Table",
          size: { w: 4, h: 8 },
          dependencies: {
            values: "intentsDialog-data:intent_utterances"
          },
          props: {
            cols: [
              { header: "Utterance",field: "intentText" },
              { header: "Count",field: "count_utterances", type: 'number' }
            ]
          },
        }
      ]
    },
    {
      id: "conversations",
      width: "60%",
      params: ["title","intent","queryspan"],
      dataSources: [
        {
          id: "conversations-data",
          type: "ApplicationInsights/Query",
          dependencies: { intent: "dialog_conversations:intent",queryTimespan: "dialog_conversations:queryspan" },
          params: {
            table: "telemetry_import_2_CL",
            queries: {
              conversations: {
                query: ({ intent }) => `
                    where recordType == "intent" and intentName == '${intent}' |
                    summarize count_intents=count(), maxTimestamp=max(timestamp) by conversationId |
                    order by maxTimestamp`,
                mappings: { id: (val, row, idx) => `Conversation ${idx}` }
              }
            }
          }
        }
      ],
      elements: [
        {
          id: "conversations-list",
          type: "Table",
          title: "Conversations",
          size: { w: 12,h: 16 },
          dependencies: { values: "conversations-data:conversations" },
          props: {
            hideBorders: true,
            cols: [
              { header: "Conversation Id",field: "id" },
              { header: "Last Message",field: "maxTimestamp",type: "time",format: "MMM-DD HH:mm:ss" },
              { header: "Count",field: "count_intents" },
              { type: "button",value: "chat",click: "openMessagesDialog" }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: "dialog:messages",
              params: { title: "args:id",conversation: "args:conversationId",queryspan: "timespan:queryTimespan" }
            }
          }
        }
      ]
    },
    {
      id: "messages",
      width: "50%",
      params: ["title","conversation","queryspan"],
      dataSources: [
        {
          id: "messages-data",
          type: "ApplicationInsights/Query",
          dependencies: { conversation: "dialog_messages:conversation",queryTimespan: "dialog_messages:queryspan" },
          params: {
            query: ({ conversation }) => `
              telemetry_import_2_CL
              | where recordType in ("intent", "response") and (intentText != '' or responseText != '')
              | order by timestamp asc
              | extend message=strcat(responseText, intentText)
              | top 200 by timestamp asc
              | project timestamp, eventName=recordType, message `
          }
        }
      ],
      elements: [
        {
          id: "messages-list",
          type: "Table",
          title: "Messages",
          size: { w: 12,h: 16 },
          dependencies: { values: "messages-data" },
          props: {
            rowClassNameField: "eventName",
            cols: [
              { header: "Timestamp",width: "50px",field: "timestamp",type: "time",format: "MMM-DD HH:mm:ss" },
              { header: "Message",field: "message" }
            ]
          }
        }
      ]
    },
    {
      id: "errors",
      width: "90%",
      params: ["title","queryspan"],
      dataSources: [
        {
          id: "errors-group",
          type: "ApplicationInsights/Query",
          dependencies: { queryTimespan: "dialog_errors:queryspan" },
          params: {
            query: () => `
              exceptions
              | summarize error_count=count() by type, innermostMessage
              | project type, innermostMessage, error_count
              | order by error_count desc `
          },
          calculated: (state) => {
            const { values } = state;
            return {
              groups: values
            };
          }
        },
        {
          id: "errors-selection",
          type: "ApplicationInsights/Query",
          dependencies: { queryTimespan: "dialog_errors:queryspan",type: "args:type",innermostMessage: "args:innermostMessage" },
          params: {
            query: ({ type, innermostMessage }) => `
              exceptions
              | where type == '${type}'
              | where innermostMessage == "${innermostMessage}"
              | extend conversationId=customDimensions.conversationId
              | project timestamp, type, innermostMessage, client_IP, conversationId
              | order by timestamp`
          }
        }
      ],
      elements: [
        {
          id: "errors-list",
          type: "SplitPanel",
          title: "Errors",
          size: { w: 12,h: 16 },
          dependencies: { groups: "errors-group",values: "errors-selection" },
          props: {
            group: { field: "type",secondaryField: "innermostMessage",countField: "error_count" },
            cols: [
              { header: "Timestamp",field: "timestamp" },
              { header: "Type",field: "type",secondaryHeader: "Message",secondaryField: "innermostMessage" },
              { header: "Conversation Id",field: "conversationId",secondaryHeader: "Client IP",secondaryField: "client_IP" },
              { type: "button",value: "more",click: "openErrorDetail" }
            ]
          },
          actions: {
            select: {
              action: "errors-selection:updateDependencies",
              params: { title: "args:type",type: "args:type",innermostMessage: "args:innermostMessage",queryspan: "timespan:queryTimespan" }
            },
            openErrorDetail: {
              action: "dialog:errorDetail",
              params: {
                title: "args:innermostMessage",
                type: "args:type",
                innermostMessage: "args:innermostMessage",
                timestamp: "args:timestamp",
                conversationId: "args:conversationId",
                queryspan: "timespan:queryTimespan"
              }
            }
          }
        }
      ]
    },
    {
      id: "errorDetail",
      width: "50%",
      params: ["title","timestamp","type","innermostMessage", "conversationId","queryspan"],
      dataSources: [
        {
          id: "errorDetail-data",
          type: "ApplicationInsights/Query",
          dependencies: {
            timestamp: "dialog_errorDetail:timestamp",
            type: "dialog_errorDetail:type",
            innermostMessage: "dialog_errorDetail:innermostMessage",
            conversationId: "dialog_errorDetail:conversationId",
            queryTimespan: "dialog_errorDetail:queryspan"
          },
          params: {
            query: ({ timestamp, type, innermostMessage, conversationId }) => `
              exceptions
              | where timestamp == '${timestamp}' and type == '${type}' and
                      innermostMessage == '${innermostMessage.replace(/'/g, "\\'")}' and
                      customDimensions.conversationId == '${conversationId}'
              | extend conversationId=customDimensions.conversationId `
          }
        }
      ],
      elements: [
        {
          id: "errorDetail-item",
          type: "Detail",
          title: "Error detail",
          size: { w: 12,h: 16 },
          dependencies: { values: "errorDetail-data" },
          props: {
            cols: [
              { header: "Timestamp",field: "timestamp" },
              { header: "Type",field: "type" },
              { header: "Message",field: "innermostMessage" },
              { header: "Conversation ID",field: "conversationId" },
              { header: "Details",field: "details" },
              { header: "Custom Dimensions",field: "customDimensions" },
              { header: "Client Type",field: "client_Type" },
              { header: "Client IP",field: "client_IP" },
              { header: "Client City",field: "client_City" },
              { header: "Client State Or Province",field: "client_StateOrProvince" },
              { header: "Client Country Or Region",field: "client_CountryOrRegion" },
              { header: "Client Role Instance",field: "client_RoleInstance" }
            ]
          }
        }
      ]
    }
  ]
}