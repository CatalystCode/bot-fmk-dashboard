# PieData

This article explains how define an PieData element. This element is composed of a [PieChart](http://recharts.org/#/en-US/api/PieChart) component.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "PieData" |
| `title`| `string` || Title that will appear at the top of the view
| `subtitle`| `string` || Description of the chart (displayed as tooltip)
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `dependencies`| `object` || Dependencies that are required for this element
| `props`| `object` || Additional properties to define for this element

## Dependencies 

Define `dependencies` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `values`| `string` | Reference to data source values

#### Dependencies sample

```js
dependencies: {
  values: "ai:timeline-channelUsage",
}
```

## Props

Define `props` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `showLegend`| `boolean` | Display legend
| `compact`| `boolean` | Display as compact chart 
| `pieProps`| `object` | [PieChart](http://recharts.org/#/en-US/api/PieChart) properties

#### Props sample

```js
props: {
  showLegend: false,
  compact: true
}
```

#### PieChart properties
- Tip: `pieProps` can be used to specify additional properties of the [PieChart](http://recharts.org/#/en-US/api/PieChart). Refer to the [PieChart API](http://recharts.org/#/en-US/api/PieChart) for more info.