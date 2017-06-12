return {
	id: "basic_sample",
	name: "Basic Sample",
	icon: "extension",
	url: "basic_sample",
	description: "A basic sample to see how data is connected to graphs",
	preview: "/images/bot-framework-preview.png",
	config: {
		connections: {  },
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
          data_for_pie: [
            { name: "value1",value: 60 },
            { name: "value2",value: 10 },
            { name: "value3",value: 30 }
          ],
          scorecard_data_value: 3000000,
          scorecard_data_subvalue: 4000
        } 
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
			dependencies: { values: "samples:data_for_pie" },
			props: { showLegend: true }
		},
    {
			id: "pie_sample2",
			type: "PieData",
			title: "Pie Sample 2",
			subtitle: "Hover on the values to see the difference from sample 1",
			size: { w: 5,h: 8 },
			dependencies: { values: "samples:data_for_pie" },
			props: { showLegend: true, compact: true }
		},
    {
      id: "scorecard_sample1",
      type: "Scorecard",
      title: "Value",
      size: { w: 1, h: 3},
      dependencies: {
        value: "samples:scorecard_data_value",
        color: "::#2196F3",
        icon: "::av_timer"
      }
    },
    {
      id: "scorecard_sample2",
      type: "Scorecard",
      title: "Same Value",
      size: { w: 1, h: 3},
      dependencies: {
        value: "samples:scorecard_data_value",
        color: "::#2196F3",
        icon: "::av_timer",
        subvalue: "samples:scorecard_data_subvalue"
      },
      props: {
        subheading: "Value #2"
      }
    }
	],
	dialogs: []
}