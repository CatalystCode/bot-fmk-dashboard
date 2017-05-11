# Dialog

The dialog view control can be used as a way to drill-down into information details. Multiple dialogs can be chained together. 

> Tip: If you are doing drill-down queries that are 3 levels deep you might want to consider the use of a SplitView control to reduce the total number of dialogs.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `width`| `string` || Define width of the view eg. `"80%"`
| `dataSources`| `object[]` || Define data source to be loaded by opening this element
| `elements`| `object[]` || Elements to be rendered using a given data source

## DataSources 

Define `dataSources` as follows:

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element
| `type`| `string` | "ApplicationInsights/Query" | Data source plugin name
| `dependencies`| `object` || A collection of key values referenced by queries
| `params`| `object` || Contains `query` and `mappings` functions

#### Dependencies

- Dialog `dependencies` are defined by referencing a dialog's id and property prefixed by "dialog_" <code>dialog_<i>id</i>:<i>property</i></code> 

#### DataSources sample

```js
[{
  id: "conversations-data",
  type: "ApplicationInsights/Query",
  dependencies: {
    intent: "dialog_conversations:intent",
    queryTimespan: "dialog_conversations:queryspan"
  },
  params: {
    query: ({ intent }) => ` customEvents` +
      ` | extend conversation = customDimensions.conversationId, intent=customDimensions.intent` +
      ` | where name startswith "message.intent" and intent =~ '${intent}'` +
      ` | summarize count=count(), maxTimestamp=max(timestamp) by tostring(conversation)` +
      ` | order by maxTimestamp`,
    mappings: {
        id: (val, row, idx) => `Conversation ${idx}`
    }
  }
}]
```

## Elements

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "Table" |
| `title`| `string` || Title that will appear at the top of the view
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `dependencies`| `object` || Values to be returned by a given `dataSource` id
| `props`| `object` || Additional properties to define for this element
| `actions`| `object` || Defined actions for this element

Note: The `props` defined here will depend on what `type` of element is used. Please check the relevant element's docs for the props details.

#### Actions

Define each action as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `action`| `string` | Reference to data source to update
| `params`| `object` | Dictionary of parameters to be passed


#### Action 

- A dialog supports the ability to open further drill-down style dialogs by defining an `action` that references another dialog's id using the "dialog" prefix <code>dialog:<i>id</i></code> 


#### Params

- Action `params` are defined by referencing a data source's id and state property using the format <code><i>id</i>:<i>property</i></code> 

- Contextual properties from the selected item can be passed by using the "args" prefix <code>args:<i>property</i></code> 

#### Elements sample

```js
[{
  id: "conversations-list",
  type: "Table",
  title: "Conversations",
  size: {
    w: 12,
    h: 16
  },
  dependencies: {
    values: "conversations-data"
  },
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
}]
```
