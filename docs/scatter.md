# Scatter

This article explains how define a Scatter element. This element is composed of an [ScatterChart](http://recharts.org/#/en-US/api/ScatterChart) component.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "Scatter" |
| `title`| `string` || Title that will appear at the top of the view
| `subtitle`| `string` || Description of the chart (displayed as tooltip)
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `dependencies`| `object` || Dependencies that are required for this element
| `props`| `object` || Additional properties to define for this element

## Dependencies 

Define `dependencies` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `groupedValues`| `string` | Reference to data source grouped values. Each group is a Scatter line.

#### Dependencies sample

```js
dependencies: {
  groupedValues: "ai:channelActivity-groupedValues"
}
```

## Props

Define `props` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `xDataKey`| `string` | x-axis data key
| `yDataKey`| `string` | y-axis data key
| `zDataKey`| `string` | z-axis data key
| `zRange`| `number[]` | Range of the z-axis used for scale of scatter points.
| `scatterProps`| `object` | [ScatterChart](http://recharts.org/#/en-US/api/ScatterChart) properties

```js
props: {
  xDataKey: "hourOfDay",
  yDataKey: "duration",
  zDataKey: "count",
  zRange: [10,500]
}
```

#### ScatterChart properties
- Tip: `scatterProps` can be used to specify additional properties of the [ScatterChart](http://recharts.org/#/en-US/api/ScatterChart). Refer to the [ScatterChart API](http://recharts.org/#/en-US/api/ScatterChart) for more info.