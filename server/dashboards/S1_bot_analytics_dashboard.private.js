return {
	id: "S1_bot_analytics_dashboard",
	name: "Sage One Bot Analytics Dashboard",
	icon: "dashboard",
	url: "S1_bot_analytics_dashboard",
	description: "Microsoft Bot Framework based analytics",
	preview: "/images/bot-framework-preview.png",
	html: `<div>
        <h1>Bot Analytics Dashboard</h1>
        <h2>Additional features</h2>
        <ul>
          <li>Modes
            <ul>
              <li>Allows fast switching between different views</li>
            </ul>
          </li>
        </ul>
        <h2>Background</h2>
        <p>
          This dashboard is designed to enable querying data on top of <a href="https://docs.microsoft.com/en-us/azure/application-insights/app-insights-analytics" target="_blank">Application Insights Analytics</a>.<br/>
          You can also extend it by developing additional <b>Data Sources</b> or <b>Visual Components</b>.
        </p>
        <br/>
        <h2>Telemetry plugin</h2>
        <p>
          To see all the capabilities of this dashboard, it is recommended to integrate you bot with one of the following:<br/>
          <a href="https://github.com/CatalystCode/bot-fmk-logging" target="_blank">Node.js Telemetry Plugin</a><br/>
          <a href="https://trpp24botsamples.visualstudio.com/_git/Code?path=%2FCSharp%2Fsample-Telemetry&amp;version=GBmaster&amp;_a=contents " target="_blank">C# Telemetry Plugin</a><br/>
          This will enable the bot to send additional telemetry information to Application Insights.
          <br/><br/>
          Keep in mind, the data that is stored on Application Insights is not Hippa compliant.
        </p>
        <br/>
        <h2>Additional Learnings</h2>
        <p>
          This dashboard uses <a href="https://docs.microsoft.com/en-us/azure/application-insights/app-insights-analytics" target="_blank">Application Insights Analytics</a>.<br/>
          You can also run queries directly using <a href="https://dev.applicationinsights.io/apiexplorer/query" target="_blank">API Explorer</a>
        </p>
      </div>`,
	config: {
		connections: {
			"application-insights": { appId: "22318fad-8036-4bf8-bc3c-002be660eb2e",apiKey: "l3krtpj1ci7zoaid8eyl8jom1n72g8f2ihan3jik" }
		},
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
				table: "customEvents",
				queries: {
					filterChannels: {
						query: () => `
              where name == 'Activity' |
              extend channel=tostring(customDimensions.channel) |
              summarize channel_count=count() by channel |
              order by channel_count`,
						mappings: { channel: (val) => val || "unknown",channel_count: (val) => val || 0 },
						calculated: (filterChannels, dependencies, prevState) => {

              if (!filterChannels) { return; }

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
						query: () => `
              extend intent=tostring(customDimensions.intent), cslen=customDimensions.callstack_length |
              where name=='MBFEvent.Intent' and (cslen == 0 or strlen(cslen) == 0) and strlen(intent) > 0 |
              summarize intent_count=count() by intent |
              order by intent_count`,
						mappings: { intent: (val) => val || "unknown",intent_count: (val) => val || 0 },
						calculated: (filterIntents, dependencies, prevState) => {

              if (!filterIntents) { return; }

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
			id: "ai",
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
						query: () => `
                extend successful=tostring(customDimensions.successful) |
                where name in ('MBFEvent.StartTransaction', 'MBFEvent.EndTransaction') |
                summarize event_count=count() by name, successful`,
						mappings: { successful: (val) => val === 'true',event_count: (val) => val || 0 },
						filters: [{ dependency: "selectedChannels",queryProperty: "customDimensions.channel" }],
						calculated: (conversions) => {

              // Conversion Handling
              // ===================

              let total, successful;
              total = _.find(conversions, { name: 'MBFEvent.StartTransaction' });
              successful = _.find(conversions, { name: 'MBFEvent.EndTransaction', successful: true }) || { event_count: 0 };

              if (!total) {
                return null;
              }

              // TODO: +5 to enable true numbers in conversions
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
              return `
                where name == 'Activity' |
                summarize count=count() by bin(timestamp, ${granularity}), name, channel=tostring(customDimensions.channel) |
                order by timestamp asc `
            },
						mappings: { channel: (val) => val || "unknown",count: (val) => val || 0 },
						filters: [{ dependency: "selectedChannels",queryProperty: "customDimensions.channel" }],
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
              return `
                  where name == 'Activity' |
                  summarize count=dcount(tostring(customDimensions.from)) by bin(timestamp, ${granularity}), name, channel=tostring(customDimensions.channel) |
                  order by timestamp asc`
            },
						mappings: { channel: (val) => val || "unknown",count: (val) => val || 0 },
						filters: [{ dependency: "selectedChannels",queryProperty: "customDimensions.channel" }],
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
						query: () => `
              extend cslen=customDimensions.callstack_length, intent=tostring(customDimensions.intent) |
              where name=='MBFEvent.Intent' and (cslen == 0 or strlen(cslen) == 0) and strlen(intent) > 0 |
              summarize count=count() by intent`,
						mappings: { intent: (val) => val || "Unknown",count: (val) => val || 0 },
						filters: [{ dependency: "selectedIntents",queryProperty: "customDimensions.intent" }],
						calculated: (intents) => {
              return {
                "intents-bars": [ 'count' ]
              };
            }
					},
					users: {
						query: () => `
                    where name=='MBFEvent.UserMessage' |
                    extend userId=tostring(customDimensions.userId) |
                    summarize dcount(userId)`,
						filters: [{ dependency: "selectedChannels",queryProperty: "customDimensions.channel" }],
						calculated: (users) => {
              return { "users-value": (users && users.length && users[0].totalUsers) || 0 };
            }
					},
					mapActivity: {
						query: () => `
                    where name=='Activity' |
                    extend location=strcat(client_City, ', ', client_CountryOrRegion) |
                    summarize location_count=count() by location |
                    extend popup=strcat('<b>', location, '</b><br />', location_count, ' messages') `,
						filters: [{ dependency: "selectedChannels",queryProperty: "customDimensions.channel" }],
						calculated: (mapActivity) => {
              return {
                "mapActivity-locations": mapActivity
              };
            }
					},
					sentiments: {
						query: () => `
                  where name startswith 'MBFEvent.Sentiment' |
                  extend score=customDimensions.score|
                  summarize sentiment=avg(todouble(score))`,
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
			dependencies: { timespan: "timespan",queryTimespan: "timespan:queryTimespan" },
			params: {
				query: () => `
            exceptions
            | summarize count_error=count() by type, innermostMessage
            | order by count_error desc `
			},
			calculated: (state) => {
        var { values } = state;

        if (!values || !values.length) {
          return {
            typesTotal: 0,
            typesTotal_color: '#AEEA00',
            typesTotal_icon: 'done'
          };
        }

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
		},
		{
			id: "retention",
			type: "ApplicationInsights/Query",
			dependencies: { timespan: "timespan",selectedTimespan: "timespan:queryTimespan",queryTimespan: "::P90D" },
			params: {
				query: () => `
          customEvents |
          where name=='Activity' |
          extend uniqueUser=tostring(customDimensions.from) |
          summarize oldestVisit=min(timestamp), lastVisit=max(timestamp) by uniqueUser |
          summarize
                  totalUnique = dcount(uniqueUser),
                  totalUniqueUsersIn24hr = countif(lastVisit > ago(24hr)),
                  totalUniqueUsersIn7d = countif(lastVisit > ago(7d)),
                  totalUniqueUsersIn30d = countif(lastVisit > ago(30d)),
                  returning24hr = countif(lastVisit > ago(24hr) and oldestVisit <= ago(24hr)),
                  returning7d = countif(lastVisit > ago(7d) and oldestVisit <= ago(7d)),
                  returning30d = countif(lastVisit > ago(30d) and oldestVisit <= ago(30d))
        `
			},
			calculated: ({ values }, { selectedTimespan }) => {

        let result = {
          totalUnique: 0,
          totalUniqueUsersIn24hr: 0,
          totalUniqueUsersIn7d: 0,
          totalUniqueUsersIn30d: 0,
          returning24hr: 0,
          returning7d: 0,
          returning30d: 0,

          total: 0,
          returning: 0,
          values: []
        };

        if (values && values.length) {
          _.extend(result, values[0]);
        }

        switch (selectedTimespan) {
          case 'PT24H':
            result.total = result.totalUniqueUsersIn24hr;
            result.returning = result.returning24hr;
            break;

          case 'P7D':
            result.total = result.totalUniqueUsersIn7d;
            result.returning = result.returning7d;
            break;

          case 'P30D':
            result.total = result.totalUniqueUsersIn30d;
            result.returning = result.returning30d;
            break;
        }

        result.values = [
          {
            timespan: '24 hours',
            retention: Math.round(100 * result.returning24hr / result.totalUniqueUsersIn24hr || 0) + '%',
            returning: result.returning24hr,
            unique: result.totalUniqueUsersIn24hr
          },
          {
            timespan: '7 days',
            retention: Math.round(100 * result.returning7d / result.totalUniqueUsersIn7d || 0) + '%',
            returning: result.returning7d,
            unique: result.totalUniqueUsersIn7d
          },
          {
            timespan: '30 days',
            retention: Math.round(100 * result.returning30d / result.totalUniqueUsersIn30d || 0) + '%',
            returning: result.returning30d,
            unique: result.totalUniqueUsersIn30d
          },
        ];

        return result;
      }
		}
	],
	filters: [
		{
			type: "TextFilter",
			title: "Timespan",
			dependencies: { selectedValue: "timespan",values: "timespan:values" },
			actions: { onChange: "timespan:updateSelectedValue" },
			first: true
		},
		{
			type: "TextFilter",
			title: "Mode",
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
			size: { w: 5,h: 8 },
			dependencies: {
				visible: "modes:messages",
				values: "ai:timeline-graphData",
				lines: "ai:timeline-channels",
				timeFormat: "ai:timeline-timeFormat"
			}
		},
		{
			id: "timeline",
			type: "Timeline",
			title: "Users Rate",
			subtitle: "How many users were sent per timeframe",
			size: { w: 5,h: 8 },
			dependencies: {
				visible: "modes:users",
				values: "ai:timeline-users-graphData",
				lines: "ai:timeline-users-channels",
				timeFormat: "ai:timeline-users-timeFormat"
			}
		},
		{
			id: "channels",
			type: "PieData",
			title: "Channel Usage",
			subtitle: "Total messages sent per channel",
			size: { w: 3,h: 8 },
			dependencies: { visible: "modes:messages",values: "ai:timeline-channelUsage" },
			props: { showLegend: false,compact: true }
		},
		{
			id: "channels",
			type: "PieData",
			title: "Channel Usage (Users)",
			subtitle: "Total users sent per channel",
			size: { w: 3,h: 8 },
			dependencies: { visible: "modes:users",values: "ai:timeline-users-channelUsage" },
			props: { showLegend: false,compact: true }
		},
		{
			id: "scores",
			type: "Scorecard",
			size: { w: 4,h: 3 },
			dependencies: {
				card_errors_value: "errors:typesTotal",
				card_errors_heading: "::Errors",
				card_errors_color: "errors:typesTotal_color",
				card_errors_icon: "errors:typesTotal_icon",
				card_errors_subvalue: "errors:typesTotal",
				card_errors_subheading: "::Avg",
				card_errors_onClick: "::onErrorsClick",
				card_sentiment_value: "ai:sentiment-height",
				card_sentiment_heading: "::Sentiment",
				card_sentiment_color: "ai:sentiment-color",
				card_sentiment_icon: "ai:sentiment-icon",
				card_sentiment_subvalue: "ai:sentiment-subvalue",
				card_sentiment_subheading: "ai:sentiment-subheading",
				card_sentiment_onClick: "::onSentimentsClick",
				card_users_value: "retention:total",
				card_users_heading: "::Unique Users",
				card_users_icon: "::account_circle",
				card_users_subvalue: "retention:returning",
				card_users_subheading: "::Returning",
				card_users_onClick: "::onUsersClick",
				card_conversions_value: "ai:conversions-rate",
				card_conversions_heading: "::Conversions",
				card_conversions_icon: "::input",
				card_conversions_color: "::#2196F3"
			},
			actions: {
				onErrorsClick: {
					action: "dialog:errors",
					params: { title: "args:heading",type: "args:type",innermostMessage: "args:innermostMessage",queryspan: "timespan:queryTimespan" }
				},
				onUsersClick: { action: "dialog:userRetention",params: { title: "args:heading",queryspan: "::P90D" } },
				onSentimentsClick: { action: "dialog:sentimentConversations",params: { title: "args:heading",queryspan: "timespan:queryTimespan" } }
			}
		},
		{
			id: "intents",
			type: "BarData",
			title: "Intents Graph",
			subtitle: "Intents usage per time",
			size: { w: 4,h: 8 },
			dependencies: { values: "ai:intents",bars: "ai:intents-bars" },
			props: { nameKey: "intent" },
			actions: {
				onBarClick: { action: "dialog:intentsDialog",params: { title: "args:intent",intent: "args:intent",queryspan: "timespan:queryTimespan" } }
			}
		},
		{
			id: "timeline-area",
			type: "Area",
			title: "Message Rate",
			subtitle: "How many messages were sent per timeframe",
			size: { w: 4,h: 8 },
			dependencies: { values: "ai:timeline-graphData",lines: "ai:timeline-channels",timeFormat: "ai:timeline-timeFormat" },
			props: { isStacked: true,showLegend: false }
		},
		{
			id: "map",
			type: "MapData",
			title: "Map Activity",
			subtitle: "Monitor regional activity",
			size: { w: 4,h: 13 },
			location: { x: 9,y: 1 },
			dependencies: { locations: "ai:mapActivity-locations" },
			props: { mapProps: { zoom: 1,maxZoom: 6 },searchLocations: true }
		}
	],
	dialogs: [
		{
			id: "intentsDialog",
			width: "70%",
			params: ["title","intent","queryspan"],
			dataSources: [
				{
					id: "intentsDialog-data",
					type: "ApplicationInsights/Query",
					dependencies: { intent: "dialog_intentsDialog:intent",queryTimespan: "dialog_intentsDialog:queryspan" },
					params: {
						table: "customEvents",
						queries: {
							"entities-usage": {
								query: ({ intent }) => `
                    extend conversation=tostring(customDimensions.conversationId),
                    entityType=tostring(customDimensions.entityType),
                    entityValue=tostring(customDimensions.entityValue),
                    intent=customDimensions.intent |
                    where name=='MBFEvent.Entity' and intent =~'${intent}' |
                    project conversation, entityType, entityValue, intent |
                    summarize entity_count=count() by entityType, entityValue`,
								calculated: (entityUsage) => {

                  // small fix
                  entityUsage.forEach(eu => eu.entityValue = eu.entityValue.length > 30 ? 'in 2 seconds' : eu.entityValue);

                  let entity_values = _.uniq(entityUsage.map(e => e.entityValue));
                  let barResults = {};

                  let results = entityUsage.forEach(entity => {
                    barResults[entity.entityType] = barResults[entity.entityType] || { entityType: entity.entityType };
                    barResults[entity.entityType][entity.entityValue] = entity.entity_count;
                  });

                  return {
                    "entities-usage": _.values(barResults),
                    "entities-usage-bars": entity_values
                  };
                }
							},
							"total-conversations": {
								query: ({ intent }) => `
                    extend conversation=tostring(customDimensions.conversationId), intent=customDimensions.intent |
                    where name=='MBFEvent.Intent' and intent =~ '${intent}' |
                    summarize count_intents=count() by conversation |
                    count
                    `,
								calculated: (results) => {
                  return {
                    "total-conversations": (results && results.length && results[0].Count) || 0
                  }
                }
							},
							intent_utterances: {
								query: ({ intent }) => `
                    extend conversation=tostring(customDimensions.conversationId),
                           intent=customDimensions.intent,
                           text=substring(customDimensions.text, 0, 50) |
                    where name=='MBFEvent.Intent' and intent =~ '${intent}' |
                    summarize count_utterances=count(), maxTimestamp=max(timestamp) by text |
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
				},
				{
					id: "intentSentiments",
					type: "ApplicationInsights/Query",
					dependencies: { intent: "dialog_intentsDialog:intent",queryTimespan: "dialog_intentsDialog:queryspan" },
					params: {
						query: ({ intent }) => `
              customEvents |
                extend intent=customDimensions.intent |
                where name startswith 'MBFEvent.Intent' and intent =~ '${intent}' |
                extend timestamp=tostring(customDimensions.timestamp),
                      conversation=tostring(customDimensions.conversationId),
                      userId=tostring(customDimensions.userId) |
                join kind= leftouter (
                    customEvents |
                    where name startswith 'MBFEvent.Sentiment' |
                    extend timestamp=tostring(customDimensions.timestamp),
                          sentiment=todouble(customDimensions.score),
                          conversation=tostring(customDimensions.conversationId),
                          userId=tostring(customDimensions.userId)
                ) on timestamp, userId, conversation |
                summarize avg(sentiment)
            `
					},
					calculated: ({ values }) => {
            let sentimentValue = +(((values && values.length && values[0].avg_sentiment) || 0) * 100, 1).toFixed(1);
            return {
              "sentiment-value": sentimentValue + '%',
              "sentiment-height": sentimentValue + '%',
              "sentiment-color": sentimentValue > 60 ? '#AEEA00' : sentimentValue < 40 ? '#D50000' : '#FF9810',
              "sentiment-icon": sentimentValue > 60 ? 'sentiment_satisfied' : sentimentValue < 40 ? 'sentiment_dissatisfied' : 'sentiment_neutral',
              "sentiment-subvalue": "",
              "sentiment-subheading" : sentimentValue > 60 ? 'Positive' : sentimentValue < 40 ? 'Negative' : 'Neutral'
            }
          }
				}
			],
			elements: [
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
					id: "utterances",
					type: "Table",
					size: { w: 4,h: 8 },
					dependencies: { values: "intentsDialog-data:intent_utterances" },
					props: {
						cols: [{ header: "Top Utterances",width: "200px",field: "text" },{ header: "Count",field: "count_utterances",type: "number" }]
					}
				},
				{
					id: "conversations-count",
					type: "Scorecard",
					size: { w: 2,h: 8 },
					dependencies: {
						card_conversations_value: "intentsDialog-data:total-conversations",
						card_conversations_heading: "::Conversations",
						card_conversations_color: "::#2196F3",
						card_conversations_icon: "::chat",
						card_conversations_onClick: "::onConversationsClick",
						card_sentiment_value: "intentSentiments:sentiment-height",
						card_sentiment_heading: "::Sentiment",
						card_sentiment_color: "intentSentiments:sentiment-color",
						card_sentiment_icon: "intentSentiments:sentiment-icon",
						card_sentiment_subvalue: "intentSentiments:sentiment-subvalue",
						card_sentiment_subheading: "intentSentiments:sentiment-subheading"
					},
					actions: {
						onConversationsClick: {
							action: "dialog:intentConversations",
							params: { title: "dialog_intentsDialog:title",intent: "dialog_intentsDialog:intent",queryspan: "dialog_intentsDialog:queryspan" }
						}
					}
				}
			]
		},
		{
			id: "intentConversations",
			width: "60%",
			params: ["title","intent","queryspan"],
			dataSources: [
				{
					id: "conversations-data",
					type: "ApplicationInsights/Query",
					dependencies: { intent: "dialog_intentConversations:intent",queryTimespan: "dialog_intentConversations:queryspan" },
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
					id: "conversations-list",
					type: "Table",
					title: "Conversations",
					size: { w: 12,h: 16 },
					dependencies: { values: "conversations-data" },
					props: {
						cols: [
							{ header: "Conversation Id",field: "id" },
							{ header: "Last Message",field: "maxTimestamp",type: "time",format: "MMM-DD HH:mm:ss" },
							{ header: "Count",field: "count" },
							{ type: "button",value: "chat",click: "openMessagesDialog" }
						]
					},
					actions: {
						openMessagesDialog: {
							action: "dialog:messages",
							params: { title: "args:id",conversation: "args:conversation",queryspan: "timespan:queryTimespan" }
						}
					}
				}
			]
		},
		{
			id: "sentimentConversations",
			width: "60%",
			params: ["title","queryspan"],
			dataSources: [
				{
					id: "sentiment-conversations-data",
					type: "ApplicationInsights/Query",
					dependencies: { queryTimespan: "dialog_sentimentConversations:queryspan" },
					params: {
						query: () => `
              customEvents
              | extend conversation=tostring(customDimensions.conversationId),
                      intent=customDimensions.intent,
                      timestamp=tostring(customDimensions.timestamp),
                      userId=tostring(customDimensions.userId)
              | where name=='MBFEvent.Intent' and intent =~ 'alarm.set'
              | join kind= leftouter (
                  customEvents |
                  where name startswith 'MBFEvent.Sentiment' |
                  extend timestamp=tostring(customDimensions.timestamp),
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
					calculated: ({ values }, dependencies) => {
            return {
              top5Positive: _.take(values, 5),
              top5Negative: _.takeRight(values, 5)
            };
          }
				}
			],
			elements: [
				{
					id: "top5positive",
					type: "Table",
					size: { w: 5,h: 8 },
					dependencies: { values: "sentiment-conversations-data:top5Positive" },
					props: {
						compact: true,
						cols: [
							{ header: "Top 5 Positive",field: "id" },
							{ header: null,width: "10px",field: "icon",type: "icon",color: "color" },
							{ header: "Last Message",field: "maxTimestamp",type: "time",format: "MMM-DD HH:mm:ss" },
							{ header: "Count",width: "10px",field: "count" },
							{ type: "button",width: "10px",value: "chat",click: "openMessagesDialog" }
						]
					},
					actions: {
						openMessagesDialog: {
							action: "dialog:messages",
							params: { title: "args:id",conversation: "args:conversation",queryspan: "timespan:queryTimespan" }
						}
					}
				},
				{
					id: "top5negative",
					type: "Table",
					size: { w: 5,h: 8 },
					dependencies: { values: "sentiment-conversations-data:top5Positive" },
					props: {
						compact: true,
						cols: [
							{ header: "Top 5 Negative",field: "id" },
							{ header: null,width: "10px",field: "icon",type: "icon",color: "color" },
							{ header: "Last Message",field: "maxTimestamp",type: "time",format: "MMM-DD HH:mm:ss" },
							{ header: "Count",field: "count" },
							{ type: "button",value: "chat",click: "openMessagesDialog" }
						]
					},
					actions: {
						openMessagesDialog: {
							action: "dialog:messages",
							params: { title: "args:id",conversation: "args:conversation",queryspan: "timespan:queryTimespan" }
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
              customEvents
              | extend intent=tostring(customDimensions.intent),
                      conversation=tostring(customDimensions.conversationId),
                      eventTimestamp=tostring(customDimensions.timestamp),
                      userId=tostring(customDimensions.userId)
              | where name == "MBFEvent.UserMessage" and conversation == '${conversation}'
              | join kind= leftouter (
                  customEvents
                  | extend sentiment=tostring(customDimensions.score),
                          eventTimestamp=tostring(customDimensions.timestamp),
                          conversation=tostring(customDimensions.conversationId),
                          userId=tostring(customDimensions.userId)
                  | where name == "MBFEvent.Sentiment" and conversation == '${conversation}'
              ) on eventTimestamp, conversation, userId
              | union (
                  customEvents
                  | extend conversation=tostring(customDimensions.conversationId),
                          intent=tostring(customDimensions.intent),
                          eventTimestamp=tostring(customDimensions.timestamp),
                          userId=tostring(customDimensions.userId)
                  | where name == "MBFEvent.BotMessage" and conversation == '${conversation}'
              )
              | project timestamp, eventName=name, message=customDimensions.text, customDimensions.userName, userId, intent, sentiment
              | order by timestamp asc
              `
					},
					calculated: (state, dependencies) => {
            let { values } = state;

            if (!values) { return; }

            let chat = values.map(msg => (
              _.extend(msg, {
                icon:  isNaN(parseInt(msg.sentiment)) ? '' :
                       msg.sentiment > 0.6 ? 'sentiment_satisfied' :
                       msg.sentiment < 0.4 ? 'sentiment_dissatisfied' : '',
                color: isNaN(parseInt(msg.sentiment)) ? '' :
                       msg.sentiment > 0.6 ? '#AEEA00' :
                       msg.sentiment < 0.4 ? '#D50000' : '',
              })
            ));

            return { chat };
          }
				}
			],
			elements: [
				{
					id: "messages-list",
					type: "Table",
					title: "Messages",
					size: { w: 12,h: 16 },
					dependencies: { values: "messages-data:chat" },
					props: {
						rowClassNameField: "eventName",
						cols: [
							{ header: "Timestamp",width: "50px",field: "timestamp",type: "time",format: "MMM-DD HH:mm:ss" },
							{ width: "10px",field: "icon",type: "icon",color: "color" },
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
					dependencies: { queryTimespan: "dialog_errors:queryspan",type: "args:type",innermostMessage: "args:innermostMessage" },
					params: {
						query: ({ type, innermostMessage }) => ` exceptions` +
            ` | where type == '${type}'` +
            ` | where innermostMessage == "${innermostMessage}"` +
            ` | extend conversationId=customDimensions["Conversation ID"]` +
            ` | project type, innermostMessage, handledAt, conversationId, operation_Id`
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
						cols: [
							{ header: "Type",field: "type",secondaryHeader: "Message",secondaryField: "innermostMessage" },
							{ header: "Conversation Id",field: "conversationId",secondaryHeader: "Operation Id",secondaryField: "operation_Id" },
							{ header: "HandledAt",field: "handledAt" },
							{ type: "button",value: "more",click: "openErrorDetail" }
						],
						group: { field: "type",secondaryField: "innermostMessage",countField: "error_count" }
					},
					actions: {
						select: {
							action: "errors-selection:updateDependencies",
							params: { title: "args:type",type: "args:type",innermostMessage: "args:innermostMessage",queryspan: "timespan:queryTimespan" }
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
				}
			]
		},
		{
			id: "errordetail",
			width: "50%",
			params: ["title","handledAt","type","operation_Id","queryspan"],
			dataSources: [
				{
					id: "errordetail-data",
					type: "ApplicationInsights/Query",
					dependencies: { operation_Id: "dialog_errordetail:operation_Id",queryTimespan: "dialog_errordetail:queryspan" },
					params: {
						query: ({ operation_Id }) => ` exceptions` +
            ` | where operation_Id == '${operation_Id}'` +
            ` | extend conversationId=customDimensions["Conversation ID"]` +
            ` | project handledAt, type, innermostMessage, conversationId, operation_Id, timestamp, details `
					}
				}
			],
			elements: [
				{
					id: "errordetail-item",
					type: "Detail",
					title: "Error detail",
					size: { w: 12,h: 16 },
					dependencies: { values: "errordetail-data" },
					props: {
						cols: [
							{ header: "Handle",field: "handledAt" },
							{ header: "Type",field: "type" },
							{ header: "Message",field: "innermostMessage" },
							{ header: "Conversation ID",field: "conversationId" },
							{ header: "Operation ID",field: "operation_Id" },
							{ header: "Timestamp",field: "timestamp" },
							{ header: "Details",field: "details" }
						]
					}
				}
			]
		},
		{
			id: "userRetention",
			width: "50%",
			params: ["title","queryspan"],
			dataSources: [],
			elements: [
				{
					id: "user-retention-table",
					type: "Table",
					title: "User Retention",
					size: { w: 12,h: 16 },
					dependencies: { values: "retention" },
					props: {
						cols: [
							{ header: "Time Span",field: "timespan" },
							{ header: "Retention",field: "retention" },
							{ header: "Returning",field: "returning" },
							{ header: "Unique Users",field: "unique" }
						]
					}
				}
			]
		}
	]
}