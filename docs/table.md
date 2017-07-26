# Table

This article explains how define a Table view control.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "Table" |
| `title`| `string` || Title that will appear at the top of the view
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `dependencies`| `object` || Dependencies that will be requested for this element
| `props`| `object` || Additional properties to define for this element
| `actions`| `object` || Defined actions for this element

## Dependencies 

Define `dependencies` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `values`| `string` | Reference to values loaded from data source

#### Dependencies sample:

```js
dependencies: {
  values: "conversations-data"
}
```

## Props 

Define `props` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `cols`| `object[]` | Collection of table column properties  
| `compact`| `boolean` | Set to `true` to enable compact view
| `hideBorders`| `boolean` | Set to `true` to hide box shadows
| `checkboxes`| `boolean` | Set to `true` to enable checkboxes
| `rowClassNameField`| `string` | Specify row style
| `defaultRowsPerPage`| `number` | Default number of rows per page

Define `props.cols` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `header`| `string` | Column header 
| `field`| `string` | Defines the query field
| `secondaryHeader`| `string` | Secondary column header
| `secondaryField`| `string` | Defines the secondary query field
| `width`| `number` | Set column width
| `type` | `string` | Either 'text', 'time', 'icon', 'button'. Default is 'text'
| `format` | `string` | If type is `time` a date format can be applied
| `value`| `string` | If type is a `icon` or `button` this will define the icon to use
| `tooltip`| `string` | If type is a `icon` this will define the tooltip to use
| `tooltipPosition`| `string` | If type is a `icon` this will define the tooltip position to use. Can be either `top`, `bottom`, `left` or `right`.
| `click`| `string` | If type is a `button` this will define the action to trigger when selecting a row

#### Props sample:

```js
props: {
  cols: [{
    header: "Conversation Id",
    field: "id"
  },{
    header: "Last Message",
    field: "maxTimestamp",
    type: "time",
    format: "MMM-DD HH:mm:ss"
  },{
    header: "Count",
    field: "count"
  },{
    type: "button",
    value: "chat",
    click: "openMessagesDialog"
  }]
},
```

## Actions

Define each action as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `action`| `string` | Reference to data source to update
| `params`| `object` | Dictionary of parameters to be passed

#### Actions sample:

```js
actions: {
  openMessagesDialog: {
    action: "dialog:messages",
    params: {
      title: "args:id",
      conversation: "args:conversation",
      queryspan: "timespan:queryTimespan"
    }
  }
}
```