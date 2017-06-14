import { createDashboard } from './utils';

let dashboard = createDashboard();
dashboard.dataSources.push({
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
});

export default dashboard;