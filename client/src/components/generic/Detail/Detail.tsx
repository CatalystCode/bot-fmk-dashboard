import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from '../GenericComponent';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Card, CardText } from 'react-md/lib/Cards';
import FontIcon from 'react-md/lib/FontIcons';
import Button from 'react-md/lib/Buttons/Button';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';

export interface IDetailProps extends IGenericProps {
  props: {
    cols: {
      header?: string,
      field?: string,
      value?: string,
      type?: 'text' | 'time' | 'icon' | 'button',
    }[]
  };
}

export interface IDetailState extends IGenericState {
  values: Object[];
}

export default class Detail extends GenericComponent<IDetailProps, IDetailState> {

  state = {
    values: []
  };

  constructor(props: IDetailProps) {
    super(props);
  }

  render() {
    var { props } = this.props;
    var { cols } = props;
    var { values } = this.state;

    if (!values) {
      return <CircularProgress key="loading" id="spinner" />;
    }

    var results = values.slice(0);

    const lists = results.map((value, ri) => {
      const items = cols.map((col, ci) => {
        const header = cols[ci].header;
        const field = cols[ci].field;
        const data = value[field];
        const key = ri + '-' + ci;
        const content = this.renderData(data);

        return (
          <li key={key}>
            <h6>{header}</h6>
            <div className="content">{content}</div>
          </li>
        );
      });

      return (
        <ul key={ri} className="details">
          {items}
        </ul>
      );
    });

    return (
      <Card>
        {lists}
      </Card>
    );
  }

  private renderData(data: any): any {
    if (data && data.length > 1 && data.substr(0, 1) === '[' && data.substr(-1) === ']') {
      const obj = JSON.parse(data);
      if (Array.isArray(obj)) {
        return this.renderArray(obj);
      }
    } else if (data && data.length > 1 && data.substr(0, 1) === '{' && data.substr(-1) === '}') {
      const obj = JSON.parse(data);
      if (typeof obj === 'object') {
        return this.renderObject(obj);
      }
    }
    return <p>{data}</p>;
  }

  private renderArray(data: any[]): any {
    const contents = data.map((obj) => this.renderObject(obj));
    return (
      <ul>
        {contents}
      </ul>
    );
  }

  private renderObject(data: any): any {
    let items = [];
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (Array.isArray(value)) {
        const nested = this.renderArray(value);
        items.push(
          <li key={key}>
            <h6>{key}</h6>
            {nested}
          </li>
        );
      } else {
        const stringValue = JSON.stringify(value);
        items.push(
          <li key={key}>
            <h6>{key}</h6>
            <p>{stringValue}</p>
          </li>
        );
      }
    });
    return items;
  }
}