# Detail

The detail view can be used to display a JSON result with HTML formatting to make it easier to inspect nested information.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "Detail" |
| `title`| `string` || Title that will appear at the top of the view
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `dependencies`| `object` || Dependencies that will be requested for this element
| `props`| `object` || Additional properties to define for this element

## Dependencies 

Define `values` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `values`| `string` | Reference to data source's id

#### Dependencies sample:

```js
dependencies: {
  values: "errordetail-data"
},
```

## Props 

Define `props` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `cols`| `object[]` | Collection of table column properties 

Define `props.cols` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `header`| `string` | Column header 
| `field`| `string` | Defines the query field

#### Props sample:

```js
props: {
    cols: [{
    header: "Handle",
    field: "handledAt"
  },{
    header: "Type",
    field: "type"
  },{
    header: "Message",
    field: "innermostMessage"
  },{
    header: "Conversation ID",
    field: "conversationId"
  },{
    header: "Operation ID",
    field: "operation_Id"
  },{
    header: "Timestamp",
    field: "timestamp"
  },{
    header: "Details",
    field: "details"
  }]
}
```