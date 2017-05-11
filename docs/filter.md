# Filter

There are 2 basic types of filter control:
1. Single selection
2. Multi-selection

## Single selection:

The **TextFilter** component is used for single selection.

| Control | UI Style | Description
| :-------|:---------|:-----------
| `TextFilter` | Select menu | Single selection menu 

## Multi-selection:

The **MenuFilter** or **CheckboxFilter** components can be used for multiple selection.

| Control | UI Style | Description
| :-------|:---------|:-----------
| `MenuFilter` | Select menu | Multi-select menu with checkbox list item controls 
| `CheckboxFilter` | Checkboxes | Multi-select checkboxes 

## Single selection properties

| Property | Type | Description 
| :--------|:-----|:-----------
| `type`| `string` | Use 'TextFilter'
| `dependencies`| `object` | Dependencies required by component
| `actions`| `object` | Contains an `onChange` action defination with a referenced dependency `string` used to update the selected value
| `first`| `boolean` | Declare as primary filter

## Single selection dependencies 

Define `dependencies` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `selectedValue`| `string` | Reference to the selected value
| `values`| `string` | Reference to option values


#### Single selection sample

```js
{
  type: "TextFilter",
  dependencies: { 
    selectedValue: "timespan", 
    values: "timespan:values"
  },
  actions: { 
    onChange: "timespan:updateSelectedValue" 
  },
  first: true
},
```

## Multi-selection properties

| Property | Type | Description 
| :--------|:-----|:-----------
| `type`| `string` | Use either 'MenuFilter', 'CheckboxFilter'
| `dependencies`| `object` | Dependencies required by component
| `actions`| `object` | Contains an `onChange` action defination with a referenced dependency `string` used to update the selected values
| `first`| `boolean` | Declare as primary filter
| `title`| `string` | Primary text label for control
| `subtitle`| `string` | Secondary text label used as selected prompt

## Multi-selection dependencies 

Define `dependencies` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `selectedValues`| `string` | Reference to the selected values
| `values`| `string` | Reference to option values

#### Multi-selection sample (using a forked data source)

```js
{
  type: "MenuFilter",
  title: "Channels",
  subtitle: "Select channels",
  dependencies: {
    selectedValues: "filters:channels-selected",
    values: "filters:channels-filters"
  },
  actions: {
    onChange: "filters:updateSelectedValues:channels-selected"
  },
  first: true
},
```