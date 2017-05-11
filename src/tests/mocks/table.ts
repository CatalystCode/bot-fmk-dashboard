export default {
  title: 'Table',
  subtitle: 'Table',
  dependencies: { values: 'data:someJsonValues' },
  actions: { },
  props: {
    checkboxes: false,
    rowClassNameField: '',
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
      }
    ] as any
  },
  layout: { "x": 1, "y": 1, "w": 1, "h": 1 }
}