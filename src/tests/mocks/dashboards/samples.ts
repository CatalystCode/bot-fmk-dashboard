import { createDashboard } from "./utils";

let dashboard = createDashboard();
dashboard.dataSources.push({
  id: "samples",
  type: "Sample",
  params: { 
    samples: { 
      values: [
        { id: "value1", count: 60 },
        { id: "value2", count: 10 },
        { id: "value3", count: 30 }
      ]
    } 
  }
});

export default dashboard;