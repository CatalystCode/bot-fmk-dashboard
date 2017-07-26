import samples from './samples';
import { createDashboard } from "./utils";

let dashboard = createDashboard(samples);
dashboard.elements.push({
  id: 'table',
  type: 'Table',
  size: { w: 1, h: 1 },
  title: 'Table',
  subtitle: 'Table',
  dependencies: { values: 'samples:values' },
  props: {
    cols: [
      {
        header: 'Conversation Id',
        field: 'id'
      }, 
      {
        header: 'Count',
        field: 'count'
      }
    ]
  }
});

export default dashboard;