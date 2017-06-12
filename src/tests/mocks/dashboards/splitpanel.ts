import { createDashboard } from "./utils";

let dashboard = createDashboard();
dashboard.dataSources.push(
  {
    id: "samples",
    type: "Sample",
    params: { 
      samples: { 
        groups: [
          { title: "value1", subtitle: "subvalue1", count: 60 },
          { title: "value2", subtitle: "subvalue2", count: 60 },
        ],
        values: [
          { id: "value1", count: 60 },
          { id: "value2", count: 10 },
          { id: "value3", count: 30 }
        ]
      }
    }
  }
);
dashboard.elements.push(
  {
    id: "splitpanel",
    type: "SplitPanel",
    title: "Values",
    size: { w: 12,h: 16 },
    dependencies: { groups: "samples:groups", values: "samples:values" },
    props: {
      group: { field: "title",secondaryField: "subtitle", countField: "count" },
      cols: [
        { header: "Id",field: "id",secondaryHeader: "Repeat Id",secondaryField: "id" },
        { header: "Count",field: "count" },
      ]
    },
    actions: {
      select: {
        action: "samples:updateDependencies",
        params: { title: "args:title",type: "args:title" }
      }
    }
  }
);

export default dashboard;