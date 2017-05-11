# Two Modes Element
This article describes how to create two modes for an element in the dashboard

## Data Source
First you'll need to create a data source that exposes a set boolean variable:

```js
{
  id: "modes",
  type: "Constant",
  params: {
    values: ["messages","users"],
    selectedValue: "messages"
  },
  calculated: (state, dependencies) => {
    let flags = {};
    flags['messages'] = (state.selectedValue === 'messages');
    flags['users'] 		= (state.selectedValue !== 'messages');
    return flags;
  }
}
```

Second, you'll need to create a filter to control that constant:

```js
{
  type: "TextFilter",
  dependencies: {
    selectedValue: "modes",
    values: "modes:values"
  },
  actions: {
    onChange: "modes:updateSelectedValue"
  }
}
```

And last, you need to create two instances of the same element (with the same id), where each appears only when their flag is on:

```js
elements: [
  {
    id: "timeline",
    type: "Timeline",
    title: "Message Rate",
    subtitle: "How many messages were sent per timeframe",
    size: { w: 5, h: 8 },
    dependencies: {
      visible: "modes:messages",
      values: "ai:timeline-graphData",
      lines: "ai:timeline-channels",
      timeFormat: "ai:timeline-timeFormat"
    }
  },
  {
    id: "timeline",
    type: "Timeline",
    title: "Users Rate",
    subtitle: "How many users were sent per timeframe",
    size: { w: 5, h: 8 },
    dependencies: {
      visible: "modes:users",
      values: "ai:timeline-users-graphData",
      lines: "ai:timeline-users-channels",
      timeFormat: "ai:timeline-users-timeFormat"
    }
  }
}]
```

Notice that each instance has a `visible` property defined under dependencies and a different set of properties and `dependencies`.