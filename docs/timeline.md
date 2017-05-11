# Timeline

This article explains how define a Timeline element. This element is composed of an [LineChart](http://recharts.org/#/en-US/api/LineChart) component.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "Timeline" |
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
| `lines`| `string` | Reference to data source lines
| `timeFormat`| `string` | Reference to data source timeline

#### Dependencies sample

```js
dependencies: {
  values: "ai:timeline-graphData",
  lines: "ai:timeline-channels",
  timeFormat: "ai:timeline-timeFormat"
}
```

## Props

Define `props` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `lineProps`| `object` | [LineChart](http://recharts.org/#/en-US/api/LineChart) properties

#### LineChart properties
- Tip: `lineProps` can be used to specify additional properties of the [LineChart](http://recharts.org/#/en-US/api/LineChart) chart component such as `syncId` to link related charts. Refer to the [LineChart API](http://recharts.org/#/en-US/api/LineChart) for more info.

```js
props: {
  lineProps: {
    syncId: "sharedId"
  }
}
```