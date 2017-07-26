# Scorecard

This article explains how define a Scorecard display control.

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "Scorecard" |
| `title`| `string` || Title that will appear at the top of the card
| `size`| `{ w: number, h: number}` || Width/Height of the card. The size of each inner card is 2x2 or 2x3 depending on subheading
| `dependencies`| `object` || Dependencies that will be requested for this element
| `props`| `object` || Additional properties to define for this element
| `actions`| `object` || Defined actions for this element

# Three States
There are 3 configurations for this element type

## Single value

Define `dependencies` as follows:

| Property | Description 
| :--------|:------------
| `value`| Large value to display
| `color`| Color to be used
| `icon`| Icon to display next to the large value
| `subvalue`| Small value to display
| `className`| Class name to add to value

Define `properties` as follow:

| Property | Type | Description 
| :--------|:-----|:------------
| `subheading`| `string` | Large value to display
| `onClick`| `string` | Action name

```js
{
  id: "errors",
  type: "Scorecard",
  title: "Errors",
  size: { w: 2, h: 3 },
  dependencies: {
    value: "errors:handledAtTotal",
    color: "errors:handledAtTotal_color",
    icon: "errors:handledAtTotal_icon",
    subvalue: "errors:handledAtTotal",
    className: "errors:handledAtTotal_class"
  },
  props: { subheading: "Avg" }
}
```

## Multiple values

Define `dependencies` as follows:

| Property | Description 
| :--------|:------------
| `values`| A collection of values containing the interface below

All items in `values` should contains:

```ts
{ 
  value: number, 
  heading: string, 
  color?: string, 
  icon?: string,
  subvalue?: number,
  subheading?: string,
  className?: string,
  onClick?: string // Name of the action to activate on click
}
```

```js
{
  id: "errors",
  type: "Scorecard",
  title: "Errors",
  size: { w: 2, h: 3 },
  dependencies: {
    values: "errors:values"
  }
}
```

## Dynamic cards

This configuration allows you to define multiple cards from multiple sources in a dynamic way.
To do that, you need to define each card in the format `card_<card name>_<property>`.

The following example shows how to define two cards, `errors` and `users` where each defines its own properties:

```js
{
  id: "scores",
  type: "Scorecard",
  size: { w: 2, h: 3 },
  dependencies: {
    card_errors_value: "errors:typesTotal",
    card_errors_heading: "::Errors",
    card_errors_color: "errors:typesTotal_color",
    card_errors_icon: "errors:typesTotal_icon",
    card_errors_subvalue: "errors:typesTotal",
    card_errors_subheading: "::Avg",
    card_errors_tooltip: "::Total errors",

    card_users_value: "ai:users-value",
    card_users_heading: "::Total Users",
    card_users_icon: "ai:users-icon"
  }
}
```

# Actions
Selected cards will call an action with the card's value.
A card value has the following properties:

| Property | Description 
| :--------|:------------
| `value`| Large value to display
| `heading`| Large heading under large value
| `color`| Color to be used
| `icon`| Icon to display next to the large value
| `subvalue`| Small value to display
| `subheading`| Small heading under small value to display
| `className`| Class name to add to value
| `tooltip`| Tooltip to display on hover

These are examples of openning a dialog when clicking on a card:

`One value card`:

```js
{
  id: "errors",
  type: "Scorecard",
  title: "Errors",
  size: { w: 2, h: 3 },
  dependencies: {
    value: "errors:handledAtTotal",
    color: "errors:handledAtTotal_color",
    icon: "errors:handledAtTotal_icon",
    subvalue: "errors:handledAtTotal",
    className: "errors:handledAtTotal_class"
  },
  props: {
    subheading: "Avg",
    onClick: "onErrorsClick"
  },
  actions: {
    onErrorsClick: {
      action: "dialog:errors",
      params: {
        title: "args:heading",
        type: "args:type",
        innermostMessage: "args:innermostMessage",
        queryspan: "timespan:queryTimespan"
      }
    }
  }
}
```

`Dyanmic card click`: 

```js
{
  id: "scores",
  type: "Scorecard",
  size: { w: 2, h: 3 },
  dependencies: {
    card_errors_value: "errors:typesTotal",
    card_errors_heading: "::Errors",
    card_errors_color: "errors:typesTotal_color",
    card_errors_icon: "errors:typesTotal_icon",
    card_errors_subvalue: "errors:typesTotal",
    card_errors_subheading: "::Avg",
    card_errors_tooltip: "::Total errors",
    card_errors_onClick: "::onErrorsClick",

    card_users_value: "ai:users-value",
    card_users_heading: "::Total Users",
    card_users_icon: "ai:users-icon"
  },
  actions: {
    onErrorsClick: {
      action: "dialog:errors",
      params: {
        title: "args:heading",
        type: "args:type",
        innermostMessage: "args:innermostMessage",
        queryspan: "timespan:queryTimespan"
      }
    }
  }
}
```