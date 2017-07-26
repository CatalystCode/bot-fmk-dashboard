export default <IDashboardConfig>{
  id: 'id',
  url: 'url',
  icon: 'icon',
  name: 'name',
  config: {
    connections: {},
    layout: {
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}
    }
  },
  dataSources: [],
  filters: [],
  elements: [],
  dialogs: []
};