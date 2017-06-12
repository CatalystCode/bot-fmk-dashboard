/// <reference path="../../../src/types.d.ts"/>
import * as _ from 'lodash';

// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: "azure_sample",
  name: "Azure Sample",
  icon: "dashboard",
  url: "azure_sample",
  description: "A basic azure sample to get connected to resources",
  preview: "/images/bot-framework-preview.png",
  html: `Azure sample dashboard`,
  config: {
    connections: { },
    layout: {
      isDraggable: true,
      isResizable: true,
      rowHeight: 30,
      verticalCompact: false,
      cols: { lg: 12,md: 10,sm: 6,xs: 4,xxs: 2 },
      breakpoints: { lg: 1200,md: 996,sm: 768,xs: 480,xxs: 0 }
    }
  },
  dataSources: [
    {
      id: "samples",
      type: "Sample",
      params: {
        samples: {
          initialValue: 0
        }
      }
    },
    {
      id: "azure",
      type: "Azure",
      dependencies: { someValue: "samples:initialValue" },
      params: { type: 'resources' },
      calculated: (state, dependencies) => {
        console.log(state);

        let resources = state.values || [];
        let resourceTypes = _.toPairs(_.groupBy(state.values, 'kind')).map(val => ({ name: val[0], value: val[1].length}));

        return  { resources, resourceTypes };
      }
    },
    {
      id: "azureLocations",
      type: "Azure",
      dependencies: { someValue: "samples:initialValue" },
      params: { type: 'locations' },
      calculated: (state, dependencies) => {
        console.log(state);

        let locations = state.values || [];
        let mapData = locations.map(loc => ({
          lat: loc.latitude,
          lng: loc.longitude,
          tooltip: loc.displayName + ': ' + loc.name
        }));

        return  { locations: mapData };
      }
    }
  ],
  filters: [],
  elements: [
    {
      id: "pie_sample1",
      type: "PieData",
      title: "Pie Sample 1",
      subtitle: "Description of pie sample 1",
      size: { w: 5,h: 8 },
      dependencies: { values: "azure:resourceTypes" },
      props: { showLegend: true }
    },
    {
      id: 'locations_map',
      type: 'MapData',
      title: "Locations Distribution",
      subtitle: "Monitor regional activity",
      size: { w: 7,h: 12 },
      dependencies: { locations: "azureLocations:locations" },
      props: { mapProps: { zoom: 1,maxZoom: 6 } }
    }
  ],
  dialogs: []
}