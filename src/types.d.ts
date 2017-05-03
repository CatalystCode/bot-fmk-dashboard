export type IDict<T> = { [id: string]: T };
export type IDictionary = IDict<any>;
type IStringDictionary = IDict<string>;

type IConnection = IStringDictionary; 
export type IConnections = IDict<IConnection>;

export interface IDataSource {
  type: string,
  id: string,
  dependencies?: IStringDictionary,
  params?: IDictionary,
  calculated?: (state: any, dependencies?: any, prevState?: any) => IDictionary
}

interface ConstantDataSource extends IDataSource {
  type: 'Constant',
  params: {
    values: string[],
    selectedValue: string
  }
}

interface AIQuery {
  (dependencies: any): string;
}

interface AIMapping {
  (value: any, row: any, idx: number): string;
}

interface AIDataSource extends IDataSource {
  type: 'ApplicationInsights/Query',
  dependencies: {
    queryTimespan: string,
    timespan?: string,
    granularity?: string
    selectedChannels?: string,
    selectedIntents?: string
  },
  params: {
    table: string,
    queries: IDict<{
      query: AIQuery,
      mappings: IDict<AIMapping>,
      filters: Array<IStringDictionary>,
      calculated: (state: any, dependencies?: any, prevState?: any) => any
    }>,
  } | {
    query: AIQuery,
    mapping: AIMapping
  };
}

type DataSource = ConstantDataSource | AIDataSource | IDataSource;

export interface IDataSourceContainer {
  dataSources: DataSource[]
}

interface Sizes<T> {
  lg?: T,
  md?: T,
  sm?: T,
  xs?: T,
  xxs?: T
}

export interface ILayout { 
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

export type ILayouts = Sizes<ILayout[]>;

export interface IDashboardConfig extends IDataSourceContainer, IElementsContainer {
  id: string,
  name: string,
  icon?: string,
  url: string,
  description?: string,
  preview?: string,
  config: {
    connections: IConnections,
    layout: {
      isDraggable?: boolean,
      isResizable?: boolean,
      rowHeight?: number,
      verticalCompact?: boolean, // Turns off compaction so you can place items wherever.
      cols: Sizes<number>,
      breakpoints: Sizes<number>,
      layouts: ILayouts
    }
  },
  filters: IFilter[]
  dialogs: IDialog[]
}

interface IElement {
  id: string
  type: string
  size: { w: number, h: number }
  title?: string
  subtitle?: string
  theme?: string[]
  dependencies?: IStringDictionary,
  props?: IDictionary,
  actions?: IDictionary
}

interface IFilter {
  type: string,
  dependencies?: IStringDictionary,  
  actions?: IStringDictionary,
  title?: string,
  subtitle?: string,
  icon?: string,
  first: boolean
}

export interface IElementsContainer {
  elements: IElement[]  
}

export interface IDialog extends IDataSourceContainer, IElementsContainer {
  id: string
  width?: string | number
  params: string[]
}

export type IAction = string | {
  action: string,
  params: IStringDictionary
}

export interface ISetupConfig {
  stage: string;
  admins: string[];
  enableAuthentication: boolean;
  allowHttp: boolean;
  redirectUrl: string;
  clientID: string;
  clientSecret: string;
}