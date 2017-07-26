import { createDashboard } from "./utils";

let someJsonValues = [
  { id: 1, count: 2 },
  { id: 2, count: 0 }
];

let dashboard = createDashboard();
dashboard.dataSources.push({
  id: 'data',
  type: 'Constant',
  params: {
    selectedValue: 'default'
  },
  calculated: (state, dependencies) => {

    someJsonValues.push({ id: 3, count: 10 });
    return { someJsonValues };
  }
});

export let dashboard2 = createDashboard();
dashboard2.dataSources.push(
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
		}
);

export default dashboard;