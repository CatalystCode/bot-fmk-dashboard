return {
  id: 'bot_health_dashboard',
  name: 'Bot Health Dashboard',
  description: 'Microsoft Bot Framework based health',
  preview: '/images/bot-framework-preview.png',
  config: {
    connections: { },
    layout: {
      isDraggable: true,
      isResizable: true,
      rowHeight: 30,
      // This turns off compaction so you can place items wherever.
      verticalCompact: false,
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}
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
			id: 'ai',
      type: "ApplicationInsights/Query",
      dependencies: { timespan: "timespan", queryTimespan: "timespan:queryTimespan", granularity: "timespan:granularity" },
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
            }
          },
          users: {
            query: `summarize totalUsers=count() by user_Id`
          },
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
            }
          }
				}
      },
			calculated: [
				
        // Conversions Extraction
        (state) => {

					// Conversion Handling
					// ===================
					var { conversions } = state;

					var total = _.find(conversions, { name: 'message.convert.start' });
					var successful = _.find(conversions, { name: 'message.convert.end', successful: true }) || { event_count: 0 };

					if (!total) {
						return null;
					}

					var displayValues = [
						{ label: 'Successful', count: successful.event_count },
						{ label: 'Failed', count: total.event_count - successful.event_count + 5 },
					];

					return {
						"conversions-displayValues": displayValues
					};
				},
				
        // Timeline Activity Extraction
        (state) => {

					// Timeline handling
					// =================

					var { timeline } = state;
					var _timeline = {};
					var _channels = {};
					var timeline = state.timeline || [];
					var timespan = state.timespan;

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
				},

        // Intents Extraction
        (state) => {
          return {
            "intents-bars": [ 'count' ]
          };
        },

        // Users Extraction
        (state) => {
          var { users } = state;
          let result = 0;
          if (users.length === 1 && users[0].totalUsers > 0) {
            result = users[0].totalUsers;
          }
          return {
            "users-value": result,
            "users-icon": 'account_circle'
          };
        },

        // Channel Activity Extraction
        (state) => {
          var { channelActivity } = state;
          var groupedValues = _.chain(channelActivity).groupBy('channel').value();
          return {
            "channelActivity-groupedValues": groupedValues
          };
        }
			]
		},
    {
      id: "errors",
      type: "ApplicationInsights/Query",
      dependencies: { timespan: "timespan", queryTimespan: "timespan:queryTimespan" },
      params: {
        query: () => ` exceptions` +
            ` | summarize count_error=count() by handledAt, innermostMessage` +
            ` | order by count_error desc `,
        mappings: {
          "handledAt": (val) => val || "Unknown",
          "count": (val, row) => row.count_error
        }
      },
      calculated: (state) => {
        var { values } = state;

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
    }
  ],
  filters: [
    {
      type: "TextFilter",
      dependencies: { selectedValue: "timespan", values: "timespan:values" },
      actions: { onChange: "timespan:updateSelectedValue" },
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
      dependencies: { values: "ai:timeline-graphData", lines: "ai:timeline-channels", timeFormat: "ai:timeline-timeFormat" }
    }, 
    {
      id: "channels",
      type: "PieData",
      title: "Channel Usage",
      subtitle: "Total messages sent per channel",
      size: { w: 3, h: 8 },
      dependencies: { values: "ai:timeline-channelUsage" },
      props: { 
        showLegend: false 
      }
    }, 
    {
			id: "scores",
			type: "Scorecard",
			size: { w: 2, h: 3 },
			dependencies: {
				card_errors_value: "errors:handledAtTotal",
				card_errors_heading: "::Errors",
				card_errors_color: "errors:handledAtTotal_color",
				card_errors_icon: "errors:handledAtTotal_icon",
				card_errors_subvalue: "errors:handledAtTotal",
				card_errors_subheading: "::Avg",
				card_errors_className: "errors:handledAtTotal_class",
				card_errors_onClick: "::onErrorsClick",

				card_users_value: "ai:users-value",
				card_users_heading: "::Total Users",
				card_users_icon: "ai:users-icon"
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
				}
			}
		},
    {
			id: "errors",
			type: "Scorecard",
			title: "Errors",
			size: { w: 2, h: 3 },
			dependencies: {
				value: "errors:handledAtTotal",
				color: "errors:handledAtTotal_color",
				icon: "errors:handledAtTotal_icon",
				subvalue: "errors:handledAtTotal",
				className: "errors:handledAtTotal_class"
			},
			props: {
				subheading: "Avg",
        onClick: "onErrorsClick"
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
      id: "conversions",
      type: "PieData",
      title: "Conversion Rate",
      subtitle: "Total conversion rate",
      size: { w: 4, h: 8 },
      dependencies: { values: "ai:conversions-displayValues" },
      props: {
        pieProps: { nameKey: "label", valueKey: "count" }
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
              onClick: "openMessagesDialog"
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
      width: "70%",
      params: ["title", "queryspan"],
      dataSources: [{
        id: "errors-data",
        type: "ApplicationInsights/Query",
        dependencies: {
          queryTimespan: "dialog_errors:queryspan"
        },
        params: {
          query: () => ` exceptions` +
            ` | summarize errors=count() by type, innermostMessage` +
            ` | project type, innermostMessage, errors` +
            ` | order by errors desc `
        }
      }],
      elements: [{
        id: "errors-list",
        type: "Table",
        title: "Errors",
        size: {
          w: 12,
          h: 16
        },
        dependencies: {
          values: "errors-data"
        },
        props: {
          cols: [{
            header: "Type",
            field: "type"
          }, {
            header: "Message",
            field: "innermostMessage"
          }, {
            header: "Count",
            field: "errors"
          }, {
            type: "button",
            value: "more",
            onClick: "openErrorType"
          }]
        },
        actions: {
          openErrorType: {
            action: "dialog:errortypes",
            params: {
              title: "args:type",
              type: "args:type",
              innermostMessage: "args:innermostMessage",
              queryspan: "timespan:queryTimespan"
            }
          }
        }
      }]
    }, {
      id: "errortypes",
      width: "90%",
      params: ["title", "type", "handledAt", "innermostMessage", "queryspan"],
      dataSources: [{
        id: "errortypes-data",
        type: "ApplicationInsights/Query",
        dependencies: {
          type: "dialog_errortypes:type",
          innermostMessage: "dialog_errortypes:innermostMessage",
          queryTimespan: "dialog_errortypes:queryspan"
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
        id: "errortypes-list",
        type: "Table",
        title: "Error types",
        size: {
          w: 12,
          h: 16
        },
        dependencies: {
          values: "errortypes-data"
        },
        props: {
          cols: [{
            header: "Type",
            field: "type"
          }, {
            header: "Message",
            field: "innermostMessage"
          }, {
            header: "Handle",
            field: "handledAt"
          }, {
            header: "Conversation ID",
            field: "conversationId"
          }, {
            header: "Opereration ID",
            field: "operation_Id"
          }, {
            type: "button",
            value: "more",
            onClick: "openErrorDetail"
          }]
        },
        actions: {
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
    }, {
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
    }
  ]
}