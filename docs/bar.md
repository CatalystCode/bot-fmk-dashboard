# BarData

This article explains how define a BarData element. This element is composed of a [BarChart](http://recharts.org/#/en-US/api/BarChart) component.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "BarData" |
| `title`| `string` || Title that will appear at the top of the view
| `subtitle`| `string` || Description of the chart (displayed as tooltip)
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `dependencies`| `object` || Dependencies that are required for this element
| `props`| `object` || Additional properties to define for this element
| `actions`| `object` || Actions to trigger when bar is clicked

## Dependencies 

Define `dependencies` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `values`| `string` | Reference to data source values
| `bars`| `string` | Reference to data source bars

#### Dependencies sample

```js
dependencies: {
  values: "ai:intents",
  bars: "ai:intents-bars",
}
```

## Props

Define `props` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `nameKey`| `string` | Data key to use for x-axis
| `barProps`| `object` | [BarChart](http://recharts.org/#/en-US/api/BarChart) properties

#### Props sample

```js
props: {
  nameKey: "intent"
}
```

#### BarChart properties
- Tip: `barProps` can be used to specify additional properties of the [BarChart](http://recharts.org/#/en-US/api/BarChart). Refer to the [BarChart API](http://recharts.org/#/en-US/api/BarChart) for more info.

## Actions

Define an `onBarClick` action as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `action`| `string` | Reference to dialog id
| `params`| `object` | Arguments or properties that need to be passed to run the dialog's query

#### Actions sample

```js
actions: {
  onBarClick: {
    action: "dialog:conversations",
    params: {
      title: "args:intent",
      intent: "args:intent",
      queryspan: "timespan:queryTimespan"
    }
  }
}
```

