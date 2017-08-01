return {
	id: "handoff",
	name: "Handoff conversations dashboard",
	icon: "question_answer",
	url: "handoff",
	description: "A sample",
	preview: "/images/bot-framework-preview.png",
	html: `<h1>Sample</h1>`,
	config: {
		connections: {
			"application-insights": { appId: "18e0a47a-850e-465f-8c9f-51d719a80e44",apiKey: "ycj5x814kjxj8ihx4b8bhrpksywq645tzaj4je2u" }
		},
		layout: {
			isDraggable: true,
			isResizable: true,
			rowHeight: 30,
			verticalCompact: false,
			cols: { lg: 12,md: 10,sm: 6,xs: 4,xxs: 2 },
			breakpoints: { lg: 1200,md: 996,sm: 768,xs: 480,xxs: 0 },
			layouts: {  }
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
			id: "ai",
			type: "ApplicationInsights/Query",
			dependencies: { timespan: "timespan",queryTimespan: "timespan:queryTimespan",granularity: "timespan:granularity" },
			params: {
				table: "customEvents",
				queries: {
					transcripts: {
						query: () => `
                where name == 'Transcript'
                | extend customerName=tostring(customDimensions.customerName), 
                  text=tostring(customDimensions.text), 
                  userTime=tostring(customDimensions.timestamp), 
                  state=toint(customDimensions.state), 
                  agentName=tostring(customDimensions.agentName), 
                  from=tostring(customDimensions.from)  
                | project from, text, customerName, agentName, state, userTime 
                | order by userTime asc`,
						mappings: { agentName: (val) => val === '' },
						calculated: (transcripts) => {
              //console.log('transcripts', transcripts);

              const key = 'customerName';
              const transcriptsGrouped = transcripts.reduce((a, c) => {
                const i = a.findIndex(col => col.id === c[key]);
                if ( i === -1 ) {
                  let collection = {
                    'id': c[key],
                    'transcripts': []
                  };
                  a.push(collection); // new group
                } else {
                  a[i].transcripts.push(c); // append to group
                }
                return a;
              }, []);

              const DP = 2;
              const SEC_PER_DAY = 86400; // 60 * 60 * 24;
              let times = [];

              transcriptsGrouped.forEach(userTranscript => {
                //console.log(userTranscript.id);
                let prevTranscript = null;
                userTranscript.transcripts.forEach(transcript => {
                  if (prevTranscript && prevTranscript.state === 1 && transcript.state === 2) {
                    let date1 = new Date(prevTranscript.userTime);
                    let date2 = new Date(transcript.userTime);
                    let diff = (date2 - date1) / SEC_PER_DAY;
                    times.push(diff);
                    //console.log(transcript.customerName, 'waiting for', diff.toFixed(2), 'secs |', prevTranscript.userTime, '->', transcript.userTime  );
                  }
                  prevTranscript = transcript;
                });
              });

              const avgTimeWaiting = times.reduce((a,c) => { return a+c },0) / times.length;
              const maxTimeWaiting = Math.max(...times); //times.reduce((a,c) => { return Math.max(a+c) });
              const minTimeWaiting = Math.min(...times); 

              return {
                'transcriptsAverageTimeWaiting-value': avgTimeWaiting.toFixed(DP),
                'transcriptsLongestTimeWaiting-value': maxTimeWaiting.toFixed(DP),
                'transcriptsShortestTimeWaiting-value': minTimeWaiting.toFixed(DP),
              };
            }
					},
					transcriptsTimeline: {
						query: () => `
                where name == 'Transcript'
                | extend customerName=tostring(customDimensions.customerName), 
                  text=tostring(customDimensions.text), 
                  userTime=tostring(customDimensions.timestamp), 
                  state=toint(customDimensions.state), 
                  agentName=tostring(customDimensions.agentName), 
                  from=tostring(customDimensions.from) 
                | where state == 0 or state == 2 
                | project from, text, customerName, agentName, state, userTime 
                | order by userTime desc`,
						mappings: { agentName: (val) => val === '' },
						calculated: (transcripts, dependencies) => {
              console.log('transcriptsTimeline', transcripts);

              const {timespan} = dependencies;
              const interval = (timespan === '24 hours' ? 'hour' : 'date');

              const dateKey = 'userTime';
              const timestampKey = 'time'; // 'timestamp'
              const transcriptsDateTime = transcripts.map((transcript) => {
                let date = new Date(transcript[dateKey]);
                interval === 'hour' ? date.setMinutes(0,0,0) : date.setHours(0-(date.getTimezoneOffset()/60),0,0,0) ;
                //transcript[timestampKey] = date.toISOString().substring(0,19)+'Z'; // 2017-05-21T00:00:00Z
                transcript[timestampKey] = date.toUTCString(); // Tue, 16 May 2017 00:00:00 GMT
                //console.log(transcript);
                return transcript;
              });

              //sort((a,b)=>b[dateKey]-a[dateKey])
              const stateKey = 'state';
              const states = ['bot','waiting','agent','watching'];
              const displayedStates = ['bot','agent'];

              const transcriptsDateTimeStateGrouped = transcriptsDateTime.reduce((a, c) => {
                const item = a.find(col => col[timestampKey] === c[timestampKey]); // && col[stateKey] === c[statesKey] 
                //console.log(_counter, '->', c[timestampKey], c[stateKey]); // a
                let state = c[stateKey];
                let recipient = states[state];
                if ( !item ) {
                  let collection = {
                    'count': 0,
                    'transcripts': [],
                  };
                  collection[timestampKey] = c[timestampKey];
                  displayedStates.forEach(displayedState => {
                    collection[displayedState] = 0;
                  });
                  a.push(collection); // new
                } else {
                  item.transcripts.push(c); // append
                  item.count += 1;
                  item[recipient] += 1;
                }
                return a;
              }, []);

              const totalBot = transcriptsDateTimeStateGrouped.reduce((a,b) => a + b.bot, 0);
              const totalAgent = transcriptsDateTimeStateGrouped.reduce((a,b) => a + b.agent, 0);
              const totalMessages = totalBot + totalAgent;

              console.log('graphData', transcriptsDateTimeStateGrouped);

              return {
                'timeline-timeFormat': (timespan === '24 hours' ? 'hour' : 'date'),
                'timeline-graphData': transcriptsDateTimeStateGrouped,
                'timeline-recipients': displayedStates,
                'transcriptsBot-value': totalBot,
                'transcriptsAgent-value': totalAgent,
                'transcriptsTotal-value': totalMessages,
              };
            }
					},
					customerTranscripts: {
						query: () => `
                where name == 'Transcript'
                | summarize 
                  maxState=max(toint(customDimensions.state)) by customerConversationId=tostring(customDimensions.userConversationId), 
                  customerName=tostring(customDimensions.customerName)`,
						calculated: (customerTranscripts) => {
              console.log('customerTranscripts', customerTranscripts);

              const bot = customerTranscripts.filter((e) => e.maxState==0);
              const waiting = customerTranscripts.filter((e) => e.maxState==1);
              const agent = customerTranscripts.filter((e) => e.maxState==2);

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
	filters: [
		{
			type: "TextFilter",
			title: "Timespan",
			dependencies: { selectedValue: "timespan",values: "timespan:values" },
			actions: { onChange: "timespan:updateSelectedValue" },
			first: true
		}
	],
	elements: [
		{
			id: "customerTotal",
			type: "Scorecard",
			title: "Users",
			size: { w: 6,h: 3 },
			dependencies: {
				card_total_heading: "::Total Users",
				card_total_value: "ai:customerTotal-value",
				card_total_color: "::#666666",
				card_total_icon: "::account_circle",
				card_bot_heading: "::Bot",
				card_bot_value: "ai:customerBot-value",
				card_bot_color: "::#00FF00",
				card_bot_icon: "::memory",
				card_agent_heading: "::Agent",
				card_agent_value: "ai:customerAgent-value",
				card_agent_color: "::#0066FF",
				card_agent_icon: "::perm_identity",
				card_waiting_heading: "::Waiting",
				card_waiting_value: "ai:customerWaiting-value",
				card_waiting_color: "::#FF6600",
				card_waiting_icon: "::more_horiz"
			}
		},
		{
			id: "customerWaiting",
			type: "Scorecard",
			title: "Waiting Times",
			size: { w: 6,h: 3 },
			dependencies: {
				card_average_heading: "::Average",
				card_average_value: "ai:transcriptsAverageTimeWaiting-value",
				card_average_color: "::#333333",
				card_average_icon: "::av_timer",
				card_max_heading: "::Longest",
				card_max_value: "ai:transcriptsLongestTimeWaiting-value",
				card_max_color: "::#ff0000",
				card_max_icon: "::timer",
				card_min_heading: "::Shortest",
				card_min_value: "ai:transcriptsShortestTimeWaiting-value",
				card_min_color: "::#0066ff",
				card_min_icon: "::timer"
			}
		},
		{
			id: "transcriptsTotal",
			type: "Scorecard",
			title: "Transcripts",
			size: { w: 2,h: 8 },
			dependencies: {
				card_total_heading: "::Total Msgs",
				card_total_value: "ai:transcriptsTotal-value",
				card_total_color: "::#666666",
				card_total_icon: "::question_answer",
				card_bot_heading: "::Bot",
				card_bot_value: "ai:transcriptsBot-value",
				card_bot_color: "::#00FF00",
				card_bot_icon: "::memory",
				card_agent_heading: "::Agent",
				card_agent_value: "ai:transcriptsAgent-value",
				card_agent_color: "::#0066FF",
				card_agent_icon: "::perm_identity"
			}
		},
		{
			id: "timelineHandoffConversations",
			type: "Area",
			title: "Conversations with bot / human",
			subtitle: "How many conversations required hand-off to human",
			size: { w: 10,h: 8 },
			dependencies: { values: "ai:timeline-graphData",lines: "ai:timeline-recipients",timeFormat: "ai:timeline-timeFormat" },
			props: { isStacked: false,showLegend: true }
		}
	],
	dialogs: []
}