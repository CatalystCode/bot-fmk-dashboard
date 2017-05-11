export default <IDashboardConfig>{
  config: {
    layout: {
      isDraggable: true,
      isResizable: true,
      rowHeight: 30,
      // This turns off compaction so you can place items wherever.
      verticalCompact: false,
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}
    }
  },
  dataSources: [],
  filters: [],
  elements: [],
  dialogs: []
};