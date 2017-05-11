export default [
  {
    id: 'timespan',
    type: 'Constant',
    params: {
      values: ['24 hours', '1 week', '1 month'],
      selectedValue: '1 month'
    },
    calculated: (state, dependencies) => {
      var queryTimespan = state.selectedValue === '24 hours' ? 'PT24H' : state.selectedValue === '1 week' ? 'P7D' : 'P30D';
      var granularity = state.selectedValue === '24 hours' ? '5m' : state.selectedValue === '1 week' ? '1d' : '1d';

      return { queryTimespan, granularity };
    }
  },
  {
    id: 'events',
    type: 'ApplicationInsights/Query',
    dependencies: { timespan: 'timespan', queryTimespan: 'timespan:queryTimespan' },
    params: {
      query: `customEvents`,
      mappings: [
        { key: 'name' },
        { key: 'successful', val: (val) => val === 'true' },
        { key: 'event_count', def: 0 }
      ]
    }
  }
]