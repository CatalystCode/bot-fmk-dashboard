import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from '../GenericComponent';
import * as _ from 'lodash';
import * as moment from 'moment';

import { DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md/lib/DataTables';
import { Card, CardText, TableCardHeader } from 'react-md/lib/Cards';
import FontIcon from 'react-md/lib/FontIcons';
import Button from 'react-md/lib/Buttons/Button';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';

export interface ITableProps extends IGenericProps {
  props: {
    checkboxes?: boolean;
    rowClassNameField?: string;
    hideBorders?: boolean;
    cols: {
      header?: string;
      field?: string;
      secondaryHeader?: string;
      secondaryField?: string;
      value?: string;
      width?: string | number;
      type?: 'text' | 'time' | 'icon' | 'button';
      click?: string;
    }[]
  };
}

export interface ITableState extends IGenericState {
  values: Object[];
}

export default class Table extends GenericComponent<ITableProps, ITableState> {

  state = {
    values: []
  };

  constructor(props: ITableProps) {
    super(props);

    this.onButtonClick = this.onButtonClick.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  onButtonClick = (col, value) => {
    this.trigger(col.click, value);
  }

  onRowClick = (row, value) => {
    let i = row.findIndex((col) => col.type === 'button');
    if (i === -1) {
      return;
    }
    this.onButtonClick(row[i], value);
  }

  fixClassName(value: string) {
    return (value && value.replace(/\./g, '-')) || null;
  }

  render() {

    let { props } = this.props;
    let { checkboxes, cols, rowClassNameField, hideBorders } = props;
    let { values } = this.state;

    if (!values) {
      return <CircularProgress key="loading" id="spinner" />;
    }
    values = values || [];

    const rows = values.map((value, ri) => (
      <TableRow
        key={ri}
        className={rowClassNameField ? this.fixClassName(value[rowClassNameField]) : null}
        onClick={this.onRowClick.bind(this, cols, value)}
      >
        {
          cols.map((col, ci) => (
            <TableColumn key={ci} className={this.fixClassName(col.field || col.value)}>{
              col.type === 'icon' ?
                <FontIcon>{col.value || value[col.field]}</FontIcon> :
                col.type === 'button' ?
                  (
                    <Button
                      icon={true}
                      onClick={this.onButtonClick.bind(this, col, value)}
                    >{col.value || value[col.field]}
                    </Button>
                  ) :
                  col.type === 'time' ?
                    moment(value[col.field]).format('MMM-DD HH:mm:ss') :
                    col.secondaryField !== undefined ? (
                      <div className="table">
                        <span className="primary">{value[col.field]}</span>
                        <span className="secondary">{value[col.secondaryField]}</span>
                      </div>
                    ) : value[col.field]
            }</TableColumn>
          ))
        }
      </TableRow>
    ));

    return (
      <Card className={ hideBorders ? 'hide-borders' : '' }>
        <DataTable plain={!checkboxes} data={checkboxes}>
          <TableHeader>
            <TableRow>
              {cols.map((col, i) => (
                <TableColumn key={i} width={col.width}>{
                  col.secondaryHeader !== undefined ? (
                    <div className="table">
                      <span className="primary">{col.header}</span>
                      <span className="secondary">{col.secondaryHeader}</span>
                    </div>
                  ) : col.header
                }</TableColumn>
              ))
              }
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows}
          </TableBody>
        </DataTable>
      </Card>
    );
  }
}