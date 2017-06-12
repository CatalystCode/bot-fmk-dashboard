/// <reference path="../../../src/types.d.ts"/>
import * as _ from 'lodash';

// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: 'cosmosdb_handoff',
  name: 'Cosmos DB conversations',
  icon: 'question_answer',
  url: 'cosmosdb_handoff',
  description: 'Conversations with option to hand-off to human',
  preview: '/images/bot-framework-preview.png',
  html: `<div>
    <h1>Cosmos DB conversations</h1>
    <p>Displays list of active conversations with a bot using Cosmos DB as the data source.</p> 
    <p>If there is a conversation of interest this can be selected to show the option to hand-off to human agent.</p>
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
      },
      'cosmos-db': {
        'host': '',
        'key': ''
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
      id: 'botConversations',
      type: 'CosmosDB/Query',
      dependencies: { timespan: 'timespan', queryTimespan: 'timespan:queryTimespan' },
      params: {
        databaseId: 'admin',
        collectionId: 'conversations',
        query: () => `SELECT * FROM conversations c WHERE (c.state = 0 OR c.state = 1) ORDER BY c.state`,
        parameters: []
      },
      calculated: (result) => {
        if (!Array.isArray(result.Documents)) {
          return null;
        }
        const values = result.Documents.reduce((destArray, currentValue) => {
          if (!currentValue.customer || !currentValue.customer.id || !currentValue.customer.conversation || 
              !currentValue.customer.conversation.id || !currentValue.customer.user || !currentValue.transcript) {
            console.warn('Unexpected Document data, missing key properties.', currentValue);
            return;
          }
          const lastMessage = currentValue.transcript.reverse().find(x => x.from !== 'Bot');
          const value = {
            userId: currentValue.customer.id,
            conversationId: currentValue.customer.conversation.id,
            username: currentValue.customer.user.name || 'Unknown',
            timestamp: lastMessage.timestamp,
            lastMessage: lastMessage.text || '',
            icon: currentValue.state === 1 ? 'perm_identity' : 'memory',
          };
          destArray.push(value);
          return destArray;
        }, []);

        return { result, values };
      }
    }
  ],
  elements: [
    {
      id: 'conversations',
      type: 'Table',
      title: 'Recent Conversations',
      subtitle: 'Monitor bot communications',
      size: { w: 12, h: 12 },
      dependencies: { values: 'botConversations:values' },
      props: {
        cols: [
          { header: 'Timestamp', field: 'timestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
          { header: 'Last Message', field: 'lastMessage' },
          { header: 'Username', field: 'username' },
          { header: 'Status', field: 'icon', type: 'icon' },
          { type: 'button', value: 'chat', click: 'openTranscriptsDialog' }
        ]
      },
      actions: {
        openTranscriptsDialog: {
          action: 'dialog:transcripts',
          params: { title: 'args:username', conversationId: 'args:conversationId', queryspan: 'timespan:queryTimespan' }
        }
      }
    }
  ],
  dialogs: [
    {
      id: 'transcripts',
      width: '60%',
      params: ['title', 'conversationId', 'queryspan'],
      dataSources: [
        {
          id: 'transcripts-data',
          type: 'CosmosDB/Query',
          dependencies: {
            conversationId: 'dialog_transcripts:conversationId',
            queryTimespan: 'dialog_transcripts:queryspan',
            secret: 'connection:bot-framework.directLine'
          },
          params: {
            databaseId: 'admin',
            collectionId: 'conversations',
            query: ({ conversationId }) => `
              SELECT * FROM conversations c 
              WHERE (c.customer.conversation['$id'] = '${conversationId}')`,
            parameters: []
          },
          calculated: (result, dependencies) => {
            if (!result.Documents) {
              return null;
            }

            let values = [];
            let customer = null;
            let body = {};
            let headers = {};
            let disabled = false;
            const { secret } = dependencies;

            if (result.Documents.length === 1) {
              let document = result.Documents[0];
              values = document.transcript || [];
              customer = document.customer;
              disabled = document.state !== 0 ? true : false;
              body = { 'conversationId': customer.conversation.id, };
              headers = { 'Authorization': `Bearer ${secret}` };
            }
            return { values, customer, headers, body, disabled };
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
            url: ({conversationsEndpoint}) => `${conversationsEndpoint}`,
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
              { header: 'Text', field: 'text' }
            ]
          }
        }
      ]
    }
  ]
};