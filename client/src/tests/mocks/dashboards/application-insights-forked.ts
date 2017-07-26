import timespan from './timespan';
import { createDashboard } from "./utils";

let dashboard = createDashboard(timespan);
dashboard.config.connections["application-insights"] = { appId: '1', apiKey: '1' };
dashboard.dataSources.push({
  id: "events",
  type: "ApplicationInsights/Query",
  dependencies: { timespan: "timespan",queryTimespan: "timespan:queryTimespan",granularity: "timespan:granularity" },
  params: {
    table: "customEvents",
    queries: {
      array1: {
        query: () => `customEvents`,
        calculated: (filterChannels, dependencies, prevState) => {
          return { "array1-calc": filterChannels };
        }
      },
      array2: {
        query: () => `customEvents2`
      }
    }
  }
});

export default dashboard;