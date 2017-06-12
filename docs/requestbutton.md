# Request Button

A button that opens a url in new window, or sends a request. 

## Basic properties

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element on the page
| `type`| `string` | "RequestButton" |
| `title`| `string` || Button title
| `size`| `{ w: number, h: number}` || Width/Height of the view
| `location`| `{ x: number, y: number}` || Grid position of the view
| `dependencies`| `object` || Dependencies that will be requested for this element
| `props`| `object` || Additional properties to define for this element

## Dependencies 

Define `dependencies` as follows:

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `body`| `object` | `''` | Request body as JSON object
| `headers`| `object` | `{}` | Request headers in `{ key : value }` dictionary format
| `disabled`| `boolean` | `false` | Button state

## Props 

Define `props` as follows:

| Property | Type | Description 
| :--------|:-----|:-----------
| `url`| `string | function` | Static url string, or a function with string injection
| `link`| `boolean` | Opens url in new window if set to `true`
| `method`| `string` | Send request using 'GET', 'POST', 'PUT', or 'DELETE'. Default is 'GET'
| `disableAfterFirstClick`| `boolean` | Only allows button to be clicked once if set to `true`
| `icon`| `string` | [Material design icon name](https://material.io/icons/) (use underscores instead of spaces)
| `buttonProps`| `string` | For additional [react-md Button props](https://react-md.mlaursen.com/components/buttons?tab=1)

NB. A Request Button can act as a link or as an xhr request, but not both.

#### Request Button sample

```js
{
  id: "agent-button",
  type: "RequestButton",
  title: "Open Webchat",
  size: { w: 2, h: 1 },
  location: { x: 2, y: 0 },
  dependencies: { token: "directLine:token", host: "::localhost:3978/webchat" },
  props: {
    url: ({token, host}) => `http://${host}/?s=${token}`,
    link: true,
    icon: "open_in_new",
    buttonProps: { 
      iconBefore: false,
      secondary: true 
    }
  }
}
```