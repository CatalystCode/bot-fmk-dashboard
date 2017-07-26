interface IQueryResults {
  Tables: IQueryResult[]
}

interface IQueryResult {
  TableName: string,
  Columns: {
    ColumnName: string,
    DataType: string,
    ColumnType: string
  }[],
  Rows: any[][]
}

interface IQueryStatus {
  Ordinal: number,
  Kind: string,
  Name: string,
  Id: string
}