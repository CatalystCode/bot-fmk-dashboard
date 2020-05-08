# Dashboard Schema

This document describes the schema which constitutes a dashboard (template and instance).

## Locations

All dashboards are stored in the server and executed on the client, with the following locations:

* `/server/dashboards/*.private.js` - JavaScript instanciated, private dashboards
* `/server/dashboards/preconfigured/*.ts` - TypeScript templates (common in the repo)
* `/server/dashboards/customTemplates/*.private.ts` - TypeScript custom, private templates (populated by saving an instanciated, private dashboard or uploading a new template).

## TypeScript Interface

[types.d.ts > IDashboardConfig](../client/@types/types.d.ts)

## Top Level

For a full hierarchical description, follow [IDashboardConfig <types.d.ts>](../client/@types/types.d.ts)

| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || Unique ID of the dashboard
| `name`| `string` || Name of the dashboard to display in the navigation header
| `icon`| `string` || icon to display in the navigation menu (Defaiult: 'dashboard')
| `url`| `string` || ID to be used in the url (should be identical to ID)
| `description`| `string` || Short description for create template page
| `preview`| `string` || Preview image for create template page
| `category`| `string` || Category for create template page
| `html`| `string` || Full HTML description for create template page
| `config`| `object` || Dashboard level configuration including connections and layouts settings
| `dataSources`| `string` || List of data sources and queries
| `filters`| `string` || List of filter elements to display at the top of the dashboard
| `elements`| `string` || List of elements to display on the dashboard
| `dialogs`| `string` || List of dialogs activated by drilling down on the dashboard elements

# Connection Definition

Connections is a dictionary holsing the connection parameters of each data source.
The property for connections definitions go under:

`root: config > connections`

```ts
{
  config: {
    connections: {
      "application-insights": { appId: "123456", apiKey: "123456" },
      "cosmos-db": { /*...*/ }
    }
  }
}
```

# Data Source Definitions

This section holds the configuration for the different data sources.
The property for connections definitions go under:

`root: dataSources`

```ts
{ 
  // used to associate to this data source as a dependency
  id: "data_source_id",
  type: "<Type Of Data Source>",

  // Dependencies define the connection between different data sources.
  // Defining a parameter here, will ensure it receives the parameter from another data source whenever it changes.
  dependencies?: {
    // This will use the default property of the data source (usually 'values')
    dependency_name_1: "data_source_1"
    dependency_name_2: "data_source_2:property_name"
  },

  // This property holds the specific configuration for each data source type
  // i.e. Constant data source requires `values` and `selectedValue` to be defined
  params?: { /*...*/ },

  // This property defined the data transformation to apply the the result, to get it ready for visual display.
  format?: '<name of format>',

  // By implementing a calculated property, you can augment additional data on the data source.
  calculated?: (state: any, dependencies?: any, prevState?: any) => IDictionary
}
```

## Example of using Calculated property

```ts
{ 
  // used to associate to this data source as a dependency
  id: "timespan",
  type: "Constant",
  params: { values: ["24 hours","1 week","1 month","3 months"],selectedValue: "1 month" },
  format: "timespan",

  calculated: (state: any, dependencies?: any, prevState?: any) => {

    // Since we're using 'Constant' data source, we have values and selectedValue in the state property
    let { values, selectedValue } = state;

    // Since we're using 'timespan' format, we have the following properties as well
    let { timespan } = state;
    let doubleValues = [];
    doubleValues.push.apply(doubleValues, values);
    doubleValues.push.apply(doubleValues, values);

    /**
     * The following line ensures that you can use those properties as dependencies in other data sources:
     * {
     *   id: 'another_data_source_id',
     *   // ...
     *   dependencies: {
     *    param1: "timespan:another-timespan",
     *    param2: "timespan:double-values",
     *   }
     * }
     */
    return {
      'another-timespan': timespan,
      'double-values': doubleValues
    };
  }
}
```

To read more on data source follow:

[Data Source Plugins](README.md#data-source-plugins)

# Elements Definition

This section holds the configuration for the different visual elements.
The property for elements definitions go under:

`root: elements`

```ts
interface IElement {
  /**
   * Unique Id used to locate and save the location of an element on a dashboard
   */
  id: string;
  /**
   * The name of the element type to be used
   * For a complete list follow:
   * https://github.com/Azure/ibex-dashboard/tree/master/docs#elements-plugins
   */
  type: string;
  /**
   * How many units (width/height) should this element take.
   * This property is overriden when the user plays with the layout in edit mode.
   */
  size: { w: number, h: number };
  /**
   * This property can usually be used when wanting to pull an element "up" in a dashboard.
   * For the following sizes (Width x Height) the last 4 columns have a vacancy of 6 rows:
   * 4x8, 4x8, 4,2
   * 
   * The last element on the next line can "pull up" by definition { x: 8, y: 2 }
   */
  location?: { x: number, y: number };
  /**
   * Title to display at the top of the element on the dashboard
   */
  title?: string;
  /**
   * A subtitle to display on a tooltip
   */
  subtitle?: string;
  /**
   * An array of colors to override the default array supplied by the dashboard.
   */
  theme?: string[];
  /**
   * Use this property on a source that uses a "format" attribute.
   * Whenever the data source is updated, the data in this element will also update.
   * 
   * Example:
   * dataSource: {
   *  id: 'dataSource1',
   *  ...
   *  format: 'pie'
   * }
   * 
   * {
   *  id: 'element1',
   *  type: 'PieData',
   *  source: 'dataSource1',
   *  ...
   * }
   */
  source?: string | IStringDictionary;
  /**
   * If you don't supply a 'source' attribute, or want to override one of the attribute,
   * You can use 'dependencies' to populate a property with data.
   * Whenever the data source is updated, the data in this element will also update.
   * 
   * Example:
   * {
   *  values: 'dataSourceX:values'
   * }
   */
  dependencies?: IStringDictionary;
  /**
   * Use to define Element Type specific properties (like showLedged, compact, etc...)
   */
  props?: IDictionary;
  /**
   * Define what should happen on certain actions like 'onclick'.
   */
  actions?: IDictionary;
}
```

[Elements Plugins](README.md#elements-plugins)

## Element Actions

[See Actions](actions.md)

# Filters Definition

[Filters](filter.md)

# Dialogs Definition

[Dialogs](dialog.md)
