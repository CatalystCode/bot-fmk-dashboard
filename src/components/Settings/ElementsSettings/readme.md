# Pie Settings
Setting up the Pie chart is very easy.
[![Preview pie settings](../../docs/pie-settings.png)]
The UI allows you to change the config file with much ease. It will map the following config:
```
{
	id: "channels",
	type: "PieData",
	title: "Channel Usage 1",
	subtitle: "Total messages sent per channel",
	size: {
		w: 6,
		h: 8
	},
	dependencies: {
		values: "ai:timeline-channelUsage"
	},
	props: {
		showLegend: false
	}
}
```
Please note, you should not change the **"dependencies"** property, and it is not being reflected in the UI as well.