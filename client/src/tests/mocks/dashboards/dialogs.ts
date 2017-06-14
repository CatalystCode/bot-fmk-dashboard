import { createDashboard } from './utils';

let dashboard = createDashboard();
dashboard.dialogs.push({
  id: "conversations",
  width: '60%',
  params: [ 'title', 'intent', 'queryspan' ],
  dataSources: [
    {
      id: 'timespan',
      type: 'Constant',
      params: {
        selectedValue: 'default'
      },
      calculated: (state, dependencies) => {

        var someJsonValues = [
          {
            id: 1,
            count: 2,
          },
          {
            id: 2,
            count: 0,
          },
          {
            id: 3,
            count: 10,
          }
        ];

        return { someJsonValues };
      }
    }
  ],
  elements: [
    {
      id: 'conversations-list',
      type: 'Table',
      title: 'Conversations',
      size: { w: 12, h: 16},
      dependencies: { values: 'timespan:someJsonValues' },
      props: {
        cols: [{
          header: 'Conversation Id',
          field: 'id'
        }, {
          header: 'Count',
          field: 'count'
        }, {
          type: 'button',
          value: 'chat',
          onClick: 'openMessagesDialog'
        }]
      }
    }
  ]
});

export default dashboard;