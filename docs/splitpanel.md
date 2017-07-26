# SplitPanel

A SplitPanel view control consists of a side bar of grouped items which can be selected to load up it's list of items. 

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "SplitPanel" |
| `title`| `string` || Title that will appear at the top of the view
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `dependencies`| `object` || Dependencies that will be requested for this element
| `props`| `object` || Additional properties to define for this element
| `actions`| `object` || Defined actions for this element

## Dependencies 

Define `dependencies` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `groups`| `string` | Reference to collection of grouped values   
| `values`| `string` | Reference to values loaded from a selected group

#### Dependencies sample:

```js
dependencies: {
  groups: "errors-group",
  values: "errors-selection"
}
```

## Props 

Takes same props as Table. Mandatory SplitPanel `props` are:

| Property | Type | Description 
| :--------|:-----|:-----------
| `cols`| `object[]` | Collection of table column properties  
| `group`| `object` | Dictionary of field names used for displaying the group title, secondary text and badge count

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
| `click`| `string` | If type is a `button` this will define the action to trigger when selecting a row

Define `props.group` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `field`| `string` | Defines the query field
| `secondaryField`| `string` | Defines the secondary query field
| `countField`| `string` | Defines the count field

#### Props sample:

```js
props: {
  cols: [{
    header: "Type",
    field: "type",
    secondaryHeader: "Message",
    secondaryField: "innermostMessage"
  }, {
    header: "Conversation Id",
    field: "conversationId",
    secondaryHeader: "Operation Id",
    secondaryField: "operation_Id"
  }, {
    header: "HandledAt",
    field: "handledAt"
  }, {
    type: "button",
    value: "more",
    click: "openErrorDetail"
  }],
  group: {
    field: "type",
    secondaryField: "innermostMessage",
    countField: "error_count"
  }
}
```

## Actions

Define each `action` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `action`| `string` | Reference to data source to update
| `params`| `object` | Dictionary of parameters to be passed

#### Actions sample:

```js
actions: {
  select: {
    action: "errors-selection:updateDependencies",
    params: {
      title: "args:type",
      type: "args:type",
      innermostMessage: "args:innermostMessage",
      queryspan: "timespan:queryTimespan"
    }
  },
  openErrorDetail: {
    action: "dialog:errordetail",
    params: {
      title: "args:operation_Id",
      type: "args:type",
      innermostMessage: "args:innermostMessage",
      handledAt: "args:handledAt",
      conversationId: "args:conversationId",
      operation_Id: "args:operation_Id",
      queryspan: "timespan:queryTimespan"
    }
  }
}
```