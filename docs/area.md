# Area

This article explains how define an Area element. This element is composed of an [AreaChart](http://recharts.org/#/en-US/api/AreaChart) component.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "Area" |
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
| `isStacked`| `boolean` | Display as stacked area 
| `showLegend`| `boolean` | Display legend
| `areaProps`| `object` | [AreaChart](http://recharts.org/#/en-US/api/AreaChart) properties

#### Props sample

```js
props: {
  isStacked: true,
  showLegend: false
}
```

#### AreaChart properties
- Tip: `areaProps` can be used to specify additional properties of the [AreaChart](http://recharts.org/#/en-US/api/AreaChart) chart component such as `syncId` to link related charts. Refer to the [AreaChart API](http://recharts.org/#/en-US/api/AreaChart) for more info.

```js
props: {
  isStacked: true,
  showLegend: false
  areaProps: {
    syncId: "sharedId"
  }
}
```