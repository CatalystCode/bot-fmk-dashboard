/// <reference path="./constant.d.ts"/>
/// <reference path="./ai.d.ts"/>
/// <reference path="./sample.d.ts"/>

type IDict<T> = { [id: string]: T };
type IDictionary = IDict<any>;
type IStringDictionary = IDict<string>;

type IConnection = IStringDictionary;
type IConnections = IDict<IConnection>;

/**
 * Dashboard configuration schema
 */
interface IDashboardConfig extends IDataSourceContainer, IElementsContainer {
  /** 
   * Unique id for the template to be used when looking up a dashboard
   */
  id: string,
  /**
   * Name to be displayed in navigation
   */
  name: string,
  /**
   * Icon to be displayed in navigation (see https://material.io/icons/)
   * Optional [Default: 'dashboard']
   */
  icon?: string,
  /**
   * An image logo to be displayed next to the title of the dashboard in the navigation header.
   * Optional [Default: None]
   */
  logo?: string,
  /**
   * The string to be used in the url (should be identical to id)
   */
  url: string,
  /**
   * A short description to display under the template in the dashboard creation screen 
   */
  description?: string,
  /**
   * An html full description to be displayed in a dialog in the dashboard creation screen
   */
  html?: string,
  /**
   * A preview image to show on the background of the template in the dashboard creation screen
   */
  preview?: string,
  /**
   * The category to put this template in the dashboard creation screen
   */
  category?: string,
  /** 
    * A flag indicates whether the template is featured at the top of the dashboard creation screen
   */
  featured?: boolean,
  /**
   * Configuration relevant for the current dashboard
   */
  config: {
    /**
     * A dictionary of connection parameters.
     * connections: {
     *  "application-insights": { appId: "123456", apiKey: "123456" },
     *  "cosmos-db": { ... }
     * }
     */
    connections: IConnections,

    /**
     * react-grid-layout properties.
     * To read more, see https://github.com/STRML/react-grid-layout#grid-layout-props
     */
    layout: {
      isDraggable?: boolean,
      isResizable?: boolean,
      rowHeight?: number,
      verticalCompact?: boolean, // Turns off compaction so you can place items wherever.
      cols: Sizes<number>,
      breakpoints: Sizes<number>
    }
  },
  filters: IFilter[]
  dialogs: IDialog[],
  layouts?: ILayouts,
}

/**
 * =============================
 *        Data Sources
 * =============================
 */

type DataSource = ConstantDataSource | AIDataSource | SampleDataSource | BotFrameworkDataSource | CosmosDBDataSource;
 
 /**
  * Data Source properties in a dashboard definition
  */
interface IDataSource {
  /**
   * The name/type of the data source - should be in the data source `type` property
   */
  type: string,
  /**
   * id for the data source - used to associate to this data source as a dependency
   */
  id: string,
  /**
   * Dependencies required for this data source to work (Optional).
   * 
   * Format:
   * dependencies: {
   *  "timespan": "data_source_id" // This will use the default property of the data source
   *  "timespan2": "data_source_id:data_source_property"
   * }
   */
  dependencies?: IStringDictionary,
  /**
   * Parameters required / optional by the specific data source (defined differently or each data source)
   */
  params?: IDictionary,
  /**
   * The format to use for transforming the data into a visual component
   */
  format?: string | {
    type: string,
    args?: IDictionary
  }
  /**
   * An optional method to apply additional transformations to the data returned from this data source.
   * The data returned will augment the data source's data and will be usable by external dependencies.
   * 
   * {
   *  id: "dataSource1",
   *  ...,
   *  calculated: (state, dependencies, prevState) => {
   *    return {
   *      "more-data": [],
   *      "more-data2": 4
   *    };
   *  }
   * }
   * 
   * Then, in another data source:
   * dependencies: {
   *  values: "dataSource1:more-data"
   * }
   */
  calculated?: (state: any, dependencies?: any, prevState?: any) => IDictionary
}

/**
 * An element that can hold one or multiple data sourecs
 */
interface IDataSourceContainer {
  dataSources: DataSource[]
}

/**
 * ====================================
 * Layouts definitions
 * ====================================
 */

interface Sizes<T> {
  lg?: T,
  md?: T,
  sm?: T,
  xs?: T,
  xxs?: T
}

interface ILayout {
  "i": string,
  "x": number,
  "y": number,
  "w": number,
  "h": number,
  minW: number,
  maxW: number,
  minH: number,
  maxH: number,
  moved: boolean,
  static: boolean,
  isDraggable: boolean,
  isResizable: boolean
}

type ILayouts = Sizes<ILayout[]>;

/**
 * ====================================
 * Template schema definitions
 * ====================================
 */

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

interface IFilter {
  type: string,
  source?: string,
  dependencies?: IStringDictionary,
  actions?: IStringDictionary,
  title?: string,
  subtitle?: string,
  icon?: string,
  first?: boolean
}

interface IElementsContainer {
  elements: IElement[]
}

interface IDialog extends IDataSourceContainer, IElementsContainer {
  id: string
  width?: string | number
  params: string[]
}

type IAction = string | {
  action: string,
  params: IStringDictionary
}

interface ISetupConfig {
  stage: string;
  admins: string[];
  enableAuthentication: boolean;
  allowHttp: boolean;
  redirectUrl: string;
  clientID: string;
  clientSecret: string;
  issuer: string;
}