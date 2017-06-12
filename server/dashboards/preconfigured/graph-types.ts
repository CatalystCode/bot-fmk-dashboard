/// <reference path="../../../src/types.d.ts"/>
import * as _ from 'lodash';

// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: 'graph_types',
  name: 'Graph Types',
  icon: "dashboard",
  url: "graph_types",
  description: 'Display the various graph types in action',
  preview: '/images/bot-framework-preview.png',
  html: ``,
  config: {
    connections: { },
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
      id: "timespan",
      type: "Constant",
      params: {
        values: ["24 hours", "1 week", "1 month", "3 months"],
        selectedValue: "1 month"
      },
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
      params: {
        values: ["messages","users"],
        selectedValue: "messages"
      },
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
      dependencies: {
        timespan: "timespan",
        queryTimespan: "timespan:queryTimespan",
        granularity: "timespan:granularity"
      },
      params: {
        table: "customEvents",
        queries: {
          filterChannels: {
            query: () => `` +
              ` where name == 'Activity' | ` +
              ` extend channel=customDimensions.channel | ` +
              ` summarize channel_count=count() by tostring(channel) | ` +
              ` order by channel_count`,
            mappings: {
              channel: (val) => val || "unknown",
              channel_count: (val) => val || 0
            },
            calculated: (filterChannels, dependencies, prevState) => {

              // This code is meant to fix the following scenario:
              // When "Timespan" filter changes, to "channels-selected" variable
              // is going to be reset into an empty set.
              // For this reason, using previous state to copy filter
              const filters = filterChannels.map((x) => x.channel);
              let selectedValues = [];
              if (prevState['channels-selected'] !== undefined) {
                selectedValues = prevState['channels-selected'];
              }
              return {
                "channels-count": filterChannels,
                "channels-filters": filters,
                "channels-selected": selectedValues,
              };
            }
          },
          filterIntents: {
            query: () => `` +
              ` extend intent=customDimensions.intent, cslen = customDimensions.callstack_length | ` +
              ` where name startswith 'message.intent' and (cslen == 0 or strlen(cslen) == 0) and strlen(intent) > 0 | ` +
              ` summarize intent_count=count() by tostring(intent) | ` +
              ` order by intent_count`,
            mappings: {
              intent: (val) => val || "unknown",
              intent_count: (val) => val || 0
            },
            calculated: (filterIntents, dependencies, prevState) => {
              const intents = filterIntents.map((x) => x.intent);
              let selectedValues = [];
              if (prevState['intents-selected'] !== undefined) {
                selectedValues = prevState['intents-selected'];
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
      id: 'ai',
      type: "ApplicationInsights/Query",
      dependencies: {
        timespan: "timespan",
        queryTimespan: "timespan:queryTimespan",
        granularity: "timespan:granularity",
        selectedChannels: "filters:channels-selected",
        selectedIntents: "filters:intents-selected"
      },
      params: {
        table: "customEvents",
        queries: {
          conversions: {
            query: () => `` +
                ` extend successful=customDimensions.successful | ` +
                ` where name startswith 'message.convert' | ` +
                ` summarize event_count=count() by name, tostring(successful)`,
            mappings: {
              "successful": (val) => val === 'true',
              "event_count": (val) => val || 0
            },
            filters: [{
              dependency: "selectedChannels",
              queryProperty: "customDimensions.channel"
            }],
            calculated: (conversions) => {

              // Conversion Handling
              // ===================

              let total, successful;
              total = _.find(conversions, { name: 'message.convert.start' });
              successful = _.find(conversions, { name: 'message.convert.end', successful: true }) || { event_count: 0 };

              if (!total) {
                return null;
              }

              var displayValues = [
                { label: 'Successful', count: successful.event_count },
                { label: 'Failed', count: total.event_count - successful.event_count + 5 },
              ];

              let conversionRate = (100 * total.event_count / (successful.event_count + 5)).toFixed(1);

              return {
                "conversions-displayValues": displayValues,
                "conversions-rate": conversionRate + '%',
              };
            }
          },
          timeline: {
            query: (dependencies) => {
              var { granularity } = dependencies;
              return `` +
                ` where name == 'Activity' | ` +
                ` summarize count=count() by bin(timestamp, ${granularity}), name, channel=tostring(customDimensions.channel) | ` +
                ` order by timestamp asc `
            },
            mappings: {
              "channel": (val) => val || "unknown",
              "count": (val) => val || 0,
            },
            filters: [{
              dependency: "selectedChannels",
              queryProperty: "customDimensions.channel"
            }],
            calculated: (timeline, dependencies) => {

              // Timeline handling
              // =================

              let _timeline = {};
              let _channels = {};
              let { timespan } = dependencies;

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
          users_timeline: {
            query: (dependencies) => {
              var { granularity } = dependencies;
              return `` +
                  ` where name == 'Activity' |` +
                  ` summarize count=dcount(tostring(customDimensions.from)) by bin(timestamp, ${granularity}), name, channel=tostring(customDimensions.channel) |` +
                  ` order by timestamp asc`
            },
            mappings: {
              channel: (val) => val || "unknown",
              count: (val) => val || 0
            },
            filters: [{
              dependency: "selectedChannels",
              queryProperty: "customDimensions.channel"
            }],
            calculated: (timeline, dependencies) => {

              // Timeline handling
              // =================

              let _timeline = {};
              let _channels = {};
              let { timespan } = dependencies;

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
            query: () => `` +
              ` extend cslen = customDimensions.callstack_length, intent=customDimensions.intent | ` +
              ` where name startswith "message.intent" and (cslen == 0 or strlen(cslen) == 0) and strlen(intent) > 0 | ` +
              ` summarize count=count() by tostring(intent)`,
            mappings: {
              "intent": (val) => val || "Unknown",
              "count": (val) => val || 0,
            },
            filters: [{
              dependency: "selectedIntents",
              queryProperty: "customDimensions.intent"
            }],
            calculated: (intents) => {
              return {
                "intents-bars": [ 'count' ]
              };
            }
          },
          users: {
            query: `summarize totalUsers=count() by user_Id`,
            filters: [{
              dependency: "selectedChannels",
              queryProperty: "customDimensions.channel"
            }],
            calculated: (users) => {
              let result = 0;
              if (users.length === 1 && users[0].totalUsers > 0) {
                result = users[0].totalUsers;
              }
              return {
                "users-value": result,
                "users-icon": 'account_circle'
              };
            }
          },
          // BUILT INTO AI -Activity-
          channelActivity: {
            query: () => `` +
                    ` where name == 'Activity' | ` +
                    ` extend channel=customDimensions.channel | ` +
                    ` extend hourOfDay=floor(timestamp % 1d, 1h) / 1hr | ` +
                    ` extend duration=tolong(customMeasurements.duration/1000) | ` +
                    ` summarize count=count() by tolong(duration), tostring(channel), hourOfDay | ` +
                    ` order by hourOfDay asc`,
            mappings: {
              duration: (val) => val || 0,
              channel: (val) => val || 'unknown'
            },
            filters: [{
              dependency: "selectedChannels",
              queryProperty: "customDimensions.channel"
            }],
            calculated: (channelActivity) => {
              var groupedValues = _.chain(channelActivity).groupBy('channel').value();
              return {
                "channelActivity-groupedValues": groupedValues
              };
            }
          },
          mapActivity: {
            query: () => `` +
                    ` extend city=client_City, region=client_CountryOrRegion | ` +
                    ` extend location=strcat(client_City, ', ', client_CountryOrRegion) | ` +
                    ` summarize location_count=count() by region, city, location | ` +
                    ` order by region, location_count `,
            mappings: {
              region: (val) => val || 'unknown',
              city: (val) => val || 'unknown',
              location: (val) => val || 'unknown',
              location_count: (val) => val || 0
            },
            filters: [{ dependency: "selectedChannels",queryProperty: "customDimensions.channel" }],
            calculated: (mapActivity) => {
              return {
                "mapActivity-locations": mapActivity
              };
            }
          },
          sentiments: {
            query: () => `` +
                  ` extend score=customDimensions.score, text=customDimensions.text | ` +
                  ` where name startswith 'message.sentiment' | ` +
                  ` summarize sentiment=avg(todouble(score))`,
            calculated: (sentiments) => {

              if (!sentiments || !sentiments.length || isNaN(sentiments[0].sentiment)) { return null; }

              var values = [
                { name: 'Positive', value: Math.round(sentiments[0].sentiment * 100) },
                { name: 'Negative', value: Math.round((1 - sentiments[0].sentiment) * 100) },
              ];

              let sentimentValue;
              sentimentValue = (sentiments[0].sentiment * 100).toFixed(1);

              return {
                "sentiment-value": values,
                "sentiment-height": sentimentValue + '%',
                "sentiment-color": sentimentValue > 60 ? '#AEEA00' : sentimentValue < 40 ? '#D50000' : '#FF9810',
                "sentiment-icon": sentimentValue > 60 ? 'sentiment_satisfied' : sentimentValue < 40 ? 'sentiment_dissatisfied' : 'sentiment_neutral',
                "sentiment-subvalue": "",
                "sentiment-subheading" : sentimentValue > 60 ? 'Positive' : sentimentValue < 40 ? 'Negative' : 'Neutral'
              };
            }
          }
        }
      }
    },
    {
      id: "errors",
      type: "ApplicationInsights/Query",
      dependencies: { timespan: "timespan", queryTimespan: "timespan:queryTimespan" },
      params: {
        query: () => `
                | summarize count_error=count() by handledAt, innermostMessage
                | order by count_error desc `,
        mappings: {
          "handledAt": (val) => val || "Unknown",
          "count": (val, row) => row.count_error
        }
      },
      calculated: (state) => {
        var { values } = state;

        if (!values || !values.length) { return; }

        var errors = values;
        var handlers = {};
        var handledAtTotal = 0;
        var handledAtUncaught = 0;
        errors.forEach(error => {
          if (!handlers[error.handledAt]) handlers[error.handledAt] = {
            name: error.handledAt,
            count: 0
          };
          handlers[error.handledAt].count += error.count;
          handledAtTotal += error.count;
          handledAtUncaught += (error.handledAt !== 'UserCode' ? error.count : 0);
        });

        return {
          errors,
          handlers: _.values(handlers),
          handledAtTotal,
          handledAtTotal_color: handledAtTotal > 0 ? '#D50000' : '#AEEA00',
          handledAtTotal_icon: handledAtTotal > 0 ? 'bug_report' : 'done',
          handledAtUncaught
        };
      }
    },
    {
      id: "total-users",
      type: "ApplicationInsights/Query",
      dependencies: { timespan: "timespan", queryTimespan: "timespan:queryTimespan" },
      params: { //Top 10 countries by traffic in the past 24 hours
        query: () => ` requests
            | where  timestamp > ago(24h)
            | summarize country_count=count() by client_CountryOrRegion
            | top 10 by country_count`
      }
    }
  ],
  filters: [
    {
      type: "TextFilter",
      title: "Timespan",
      dependencies: { selectedValue: "timespan", values: "timespan:values" },
      actions: { onChange: "timespan:updateSelectedValue" },
      first: true
    },
    {
      type: "TextFilter",
      title: "Mode",
      dependencies: { selectedValue: "modes", values: "modes:values" },
      actions: { onChange: "modes:updateSelectedValue" },
      first: true
    },
    {
      type: "MenuFilter",
      title: "Channels",
      subtitle: "Select channels",
      icon: "forum",
      dependencies: {
        selectedValues: "filters:channels-selected",
        values: "filters:channels-filters"
      },
      actions: {
        onChange: "filters:updateSelectedValues:channels-selected"
      },
      first: true
    },
    {
      type: "MenuFilter",
      title: "Intents",
      subtitle: "Select intents",
      icon: "textsms",
      dependencies: {
        selectedValues: "filters:intents-selected",
        values: "filters:intents-filters"
      },
      actions: {
        onChange: "filters:updateSelectedValues:intents-selected"
      },
      first: true
    }
  ],
  elements: [
    {
      id: "timeline",
      type: "Timeline",
      title: "Message Rate",
      subtitle: "How many messages were sent per timeframe",
      size: { w: 5, h: 8 },
      dependencies: { visible: "modes:messages", values: "ai:timeline-graphData", lines: "ai:timeline-channels", timeFormat: "ai:timeline-timeFormat" }
    },
    {
      id: "timeline",
      type: "Timeline",
      title: "Users Rate",
      subtitle: "How many users were sent per timeframe",
      size: { w: 5, h: 8 },
      dependencies: { visible: "modes:users", values: "ai:timeline-users-graphData", lines: "ai:timeline-users-channels", timeFormat: "ai:timeline-users-timeFormat" }
    },
    {
      id: "channels",
      type: "PieData",
      title: "Channel Usage",
      subtitle: "Total messages sent per channel",
      size: { w: 3, h: 8 },
      dependencies: { visible: "modes:messages", values: "ai:timeline-channelUsage" },
      props: { showLegend: false, compact: true }
    },
    {
      id: "channels",
      type: "PieData",
      title: "Channel Usage (Users)",
      subtitle: "Total users sent per channel",
      size: { w: 3, h: 8 },
      dependencies: { visible: "modes:users", values: "ai:timeline-users-channelUsage" },
      props: { showLegend: false, compact: true }
    },
    {
      id: "scores",
      type: "Scorecard",
      size: { w: 4, h: 3 },
      dependencies: {
        card_errors_value: "errors:handledAtTotal",
        card_errors_heading: "::Errors",
        card_errors_color: "errors:handledAtTotal_color",
        card_errors_icon: "errors:handledAtTotal_icon",
        card_errors_subvalue: "errors:handledAtTotal",
        card_errors_subheading: "::Avg",
        card_errors_className: "errors:handledAtTotal_class",
        card_errors_onClick: "::onErrorsClick",

        card_sentiment_value: "ai:sentiment-height",
        card_sentiment_heading: "::Sentiment",
        card_sentiment_color: "ai:sentiment-color",
        card_sentiment_icon: "ai:sentiment-icon",
        card_sentiment_subvalue: "ai:sentiment-subvalue",
        card_sentiment_subheading: "ai:sentiment-subheading",

        card_users_value: "ai:users-value",
        card_users_heading: "::Total Users",
        card_users_icon: "ai:users-icon",
        card_users_onClick: "::onUsersClick",

        card_conversions_value: "ai:conversions-rate",
        card_conversions_heading: "::Conversions",
        card_conversions_icon: "::input",
        card_conversions_color: "::#2196F3"
      },
      actions: {
        onErrorsClick: {
          action: "dialog:errors",
          params: {
            title: "args:heading",
            type: "args:type",
            innermostMessage: "args:innermostMessage",
            queryspan: "timespan:queryTimespan"
          }
        },
        onUsersClick: {
          action: "dialog:userRentention",
          params: {
            title: "args:heading",
            queryspan: "timespan:queryTimespan"
          }
        }
      }
    },
    {
      id: "intents",
      type: "BarData",
      title: "Intents Graph",
      subtitle: "Intents usage per time",
      size: { w: 4, h: 8 },
      dependencies: { values: "ai:intents", bars: "ai:intents-bars" },
      props: {
        nameKey: "intent"
      },
      actions: {
        onBarClick: {
          action: "dialog:conversations",
          params: {
            title: "args:intent",
            intent: "args:intent",
            queryspan: "timespan:queryTimespan"
          }
        }
      }
    },
    {
      id: "timeline-area",
      type: "Area",
      title: "Message Rate",
      subtitle: "How many messages were sent per timeframe",
      size: { w: 4, h: 8 },
      dependencies: { values: "ai:timeline-graphData", lines: "ai:timeline-channels", timeFormat: "ai:timeline-timeFormat" },
      props: {
        isStacked: true,
        showLegend: false
      }
    },
    {
      id: 'scatter',
      type: 'Scatter',
      title: 'Channel Activity',
      subtitle: 'Monitor channel activity across time of day',
      size: { w: 4, h: 8 },
      dependencies: { groupedValues:'ai:channelActivity-groupedValues' },
      props: {
        xDataKey: "hourOfDay",
        yDataKey: "duration",
        zDataKey: "count",
        zRange: [10,500]
      }
    },
    {
      id: "map",
      type: "MapData",
      title: "Map Activity",
      subtitle: "Monitor regional activity",
      size: { w: 4,h: 8 },
      dependencies: { locations: "ai:mapActivity-locations" },
      props: {
        mapProps:
          {
            zoom: 1,
            maxZoom: 6,
          }
      }
    },
    {
      id: "radar",
      type: "RadarChartCard",
      title: "NFL and NBA Intents Radar",
      subtitle: "Intent Count",
      size: {
        w: 4,
        h: 8
      },
      dependencies: { },
      props: { }
    },
    {
      id: "simpleradial",
      type: "SimpleRadialBarChartCard",
      title: "Simpl Radial Intent Count",
      subtitle: "Total numbef of engagment with each intent",
      size: {
        w: 4,
        h: 8
      },
      dependencies: { },
      props: { }
    },
    {
      id: "radial",
      type: "RadialBarChartCard",
      title: "Radial Intent Count",
      subtitle: "Total numbef of engagment with each intent",
      size: {
        w: 4,
        h: 8
      },
      dependencies: {  },
      props: { }
    }
  ],
  dialogs: [
    {
      id: "conversations",
      width: "60%",
      params: ["title", "intent", "queryspan"],
      dataSources: [{
        id: "conversations-data",
        type: "ApplicationInsights/Query",
        dependencies: { intent: "dialog_conversations:intent", queryTimespan: "dialog_conversations:queryspan" },
        params: {
          query: ({ intent }) => ` customEvents` +
            ` | extend conversation = customDimensions.conversationId, intent=customDimensions.intent` +
            ` | where name startswith "message.intent" and intent =~ '${intent}'` +
            ` | summarize count=count(), maxTimestamp=max(timestamp) by tostring(conversation)` +
            ` | order by maxTimestamp`,
          mappings: {
            "id": (val, row, idx) => `Conversation ${idx}`
          }
        }
      }],
      elements: [
        {
          id: "conversations-list",
          type: "Table",
          title: "Conversations",
          size: { w: 12, h: 16 },
          dependencies: { values: "conversations-data" },
          props: {
            cols: [{
              header: "Conversation Id",
              field: "id"
            }, {
              header: "Last Message",
              field: "maxTimestamp",
              type: "time",
              format: "MMM-DD HH:mm:ss"
            }, {
              header: "Count",
              field: "count"
            }, {
              type: "button",
              value: "chat",
              click: "openMessagesDialog"
            }]
          },
          actions: {
            openMessagesDialog: {
              action: "dialog:messages",
              params: {
                title: "args:id",
                conversation: "args:conversation",
                queryspan: "timespan:queryTimespan"
              }
            }
          }
        }
      ]
    },
    {
      id: "messages",
      width: "50%",
      params: ["title", "conversation", "queryspan"],
      dataSources: [
        {
          id: "messages-data",
          type: "ApplicationInsights/Query",
          dependencies: { conversation: "dialog_messages:conversation", queryTimespan: "dialog_messages:queryspan" },
          params: {
            query: ({ conversation }) => ` customEvents` +
              ` | extend conversation = customDimensions.conversationId, intent=customDimensions.intent` +
              ` | where name in ("message.send", "message.received") and conversation == '${conversation}'` +
              ` | order by timestamp asc` +
              ` | project timestamp, eventName=name, message=customDimensions.text, customDimensions.userName, customDimensions.userId`
          }
        }
      ],
      elements: [
        {
          id: "messages-list",
          type: "Table",
          title: "Messages",
          size: { w: 12, h: 16 },
          dependencies: { values: "messages-data" },
          props: {
            rowClassNameField: "eventName",
            cols: [{
              header: "Timestamp",
              width: "50px",
              field: "timestamp",
              type: "time",
              format: "MMM-DD HH:mm:ss"
            }, {
              header: "Message",
              field: "message"
            }]
          }
        }
      ]
    },
    {
      id: "errors",
      width: "90%",
      params: ["title", "queryspan"],
      dataSources: [{
        id: "errors-group",
        type: "ApplicationInsights/Query",
        dependencies: {
          queryTimespan: "dialog_errors:queryspan"
        },
        params: {
          query: () => ` exceptions` +
            ` | summarize error_count=count() by type, innermostMessage` +
            ` | project type, innermostMessage, error_count` +
            ` | order by error_count desc `
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
        dependencies: {
          queryTimespan: "dialog_errors:queryspan",
          type: "args:type",
          innermostMessage: "args:innermostMessage"
        },
        params: {
          query: ({ type, innermostMessage }) => ` exceptions` +
            ` | where type == '${type}'` +
            ` | where innermostMessage == "${innermostMessage}"` +
            ` | extend conversationId=customDimensions["Conversation ID"]` +
            ` | project type, innermostMessage, handledAt, conversationId, operation_Id`
        }
      }],
      elements: [{
        id: "errors-list",
        type: "SplitPanel",
        title: "Errors",
        size: {
          w: 12,
          h: 16
        },
        dependencies: {
          groups: "errors-group",
          values: "errors-selection",
        },
        props: {
          cols: [{
            header: "Type",
            field: "type",
            secondaryHeader: "Message",
            secondaryField: "innermostMessage"
          }, {
            header: "Conversation Id",
            field: "conversationId",
            secondaryHeader: "Operation Id",
            secondaryField: "operation_Id"
          }, {
            header: "HandledAt",
            field: "handledAt"
          }, {
            type: "button",
            value: "more",
            click: "openErrorDetail"
          }],
          group: {
            field: "type",
            secondaryField: "innermostMessage",
            countField: "error_count"
          }
        },
        actions: {
          select: {
            action: "errors-selection:updateDependencies",
            params: {
              title: "args:type",
              type: "args:type",
              innermostMessage: "args:innermostMessage",
              queryspan: "timespan:queryTimespan"
            }
          },
          openErrorDetail: {
            action: "dialog:errordetail",
            params: {
              title: "args:operation_Id",
              type: "args:type",
              innermostMessage: "args:innermostMessage",
              handledAt: "args:handledAt",
              conversationId: "args:conversationId",
              operation_Id: "args:operation_Id",
              queryspan: "timespan:queryTimespan"
            }
          }
        }
      }]
    },
    {
      id: "errordetail",
      width: "50%",
      params: ["title", "handledAt", "type", "operation_Id", "queryspan"],
      dataSources: [{
        id: "errordetail-data",
        type: "ApplicationInsights/Query",
        dependencies: {
          operation_Id: "dialog_errordetail:operation_Id",
          queryTimespan: "dialog_errordetail:queryspan"
        },
        params: {
          query: ({ operation_Id }) => ` exceptions` +
            ` | where operation_Id == '${operation_Id}'` +
            ` | extend conversationId=customDimensions["Conversation ID"]` +
            ` | project handledAt, type, innermostMessage, conversationId, operation_Id, timestamp, details `
        }
      }],
      elements: [{
        id: "errordetail-item",
        type: "Detail",
        title: "Error detail",
        size: {
          w: 12,
          h: 16
        },
        dependencies: {
          values: "errordetail-data"
        },
        props: {
          cols: [{
            header: "Handle",
            field: "handledAt"
          }, {
            header: "Type",
            field: "type"
          }, {
            header: "Message",
            field: "innermostMessage"
          }, {
            header: "Conversation ID",
            field: "conversationId"
          }, {
            header: "Operation ID",
            field: "operation_Id"
          }, {
            header: "Timestamp",
            field: "timestamp"
          }, {
            header: "Details",
            field: "details"
          }]
        }
      }]
    },
    {
      id: "userRentention",
      width: "90%",
      params: ["title", "queryspan"],
      dataSources: [
        {
          id: "userRententionDatasource",
          type: "ApplicationInsights/Query",
          dependencies: {
            queryTimespan: "dialog_userRentention:queryspan"
          },
          params: {
            query: ({ queryTimespan }) => ` customEvents |
              where timestamp > ago(90d) |
              extend uniqueUser=tostring(customDimensions.from) |
              summarize firstUsedAppTimeStamp=min(timestamp), lastUsedAppTimeStamp=max(timestamp) by uniqueUser |
              summarize
                  totalUniquesUsersIn90d = count(uniqueUser),
                  totalUniquesUsersIn24hr = countif(lastUsedAppTimeStamp > ago(24hr) and firstUsedAppTimeStamp <= ago(24hr)),
                  totalUniquesUsersIn7d = countif(lastUsedAppTimeStamp > ago(7d) and firstUsedAppTimeStamp <= ago(7d)),
                  totalUniquesUsersIn30d = countif(lastUsedAppTimeStamp > ago(30d) and firstUsedAppTimeStamp <= ago(30d)),
                  rententionOver24hr = floor( ((countif(lastUsedAppTimeStamp > ago(24hr) and firstUsedAppTimeStamp <= ago(24hr))) / (count(uniqueUser)) * 100) , 1),
                  rententionOver7d = floor( ((countif(lastUsedAppTimeStamp > ago(7d) and firstUsedAppTimeStamp <= ago(7d))) / (count(uniqueUser)) * 100) , 1),
                  rententionOver30d = floor( ((countif(lastUsedAppTimeStamp > ago(30d) and firstUsedAppTimeStamp <= ago(30d))) / (count(uniqueUser)) * 100) , 1)`,
            mappings: { }
          },
          calculated: (state) => {
            var { values } = state;

            if (!values || !values.length) { return; }

            let userRententionData = {};
            userRententionData = [
              {
                timeSpan: "24 hours",
                retention: values[0].rententionOver24hr,
                uniqueUsers: values[0].totalUniquesUsersIn24hr
              },
              {
                timeSpan: "7 days",
                retention: values[0].rententionOver7d,
                uniqueUsers: values[0].totalUniquesUsersIn7d
              },
              {
                timeSpan: "30 days",
                retention: values[0].rententionOver30d,
                uniqueUsers: values[0].totalUniquesUsersIn30d
              },
            ]
            return { userRententionData };
          }
        }],
      elements: [{
          id: "user-retention-table",
          type: "Table",
          title: "User Retention",
          size: {
            w: 12,
            h: 16
          },
          dependencies: {
            values: "userRententionDatasource:userRententionData"
          },
          props: {
            cols: [{
                header: "Time Span",
                field: "timeSpan"
              },{
                header: "Rentention",
                field: "retention"
              },{
                header: "Unique Users",
                field: "uniqueUsers"
              }]
          },
          actions: { }
        }]
    }
  ]
}