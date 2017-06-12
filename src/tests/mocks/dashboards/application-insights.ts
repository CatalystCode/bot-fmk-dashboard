import timespan from './timespan';
import { createDashboard } from "./utils";

let dashboard = createDashboard(timespan);
dashboard.config.connections["application-insights"] = { appId: '1', apiKey: '1' };
dashboard.dataSources.push({
  id: 'events',
  type: 'ApplicationInsights/Query',
  dependencies: { timespan: 'timespan', queryTimespan: 'timespan:queryTimespan' },
  params: {
    query: `customEvents`,
    mappings: { 
      name: (val, row, idx) => `name: ${val}`,
      rowname: (val, row, idx) => `RowName: ${row.name}`,
      rowindex: (val, row, idx) => `RowIndex: ${idx}` 
    }
  }
});

export default dashboard;