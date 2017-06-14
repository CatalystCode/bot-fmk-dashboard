import * as React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';

import Card from '../../Card';
import { GenericComponent, IGenericProps, IGenericState } from '../GenericComponent';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import colors from '../../colors';
const { ThemeColors } = colors;

import settings from './Settings';

interface IBarProps extends IGenericProps {
  props: {
    barProps: { [key: string]: Object };
    showLegend: boolean;
    /** The name of the property in the data source that contains the name for the X axis */
    nameKey: string;
  };
};

interface IBarState extends IGenericState {
  values: Object[];
  bars: Object[];
}

export default class BarData extends GenericComponent<IBarProps, IBarState> {

  static editor = settings;

  state = {
    values: [],
    bars: []
  };

  constructor(props: any) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(data: any, index: number) {
    this.trigger('onBarClick', data.payload);
  }

  render() {
    var { values, bars } = this.state;
    var { title, subtitle, props } = this.props;
    var { barProps, showLegend, nameKey } = props;

    if (!values) {
      return null;
    }

    if (!values || !values.length) {
      return (
        <Card title={title} subtitle={subtitle}>
          <div style={{ padding: 20 }}>No data is available</div>
        </Card>
      );
    }

    var barElements = [];
    if (values && values.length && bars) {
      barElements = bars.map((bar, idx) => {
        return (
          <Bar 
            key={idx} 
            stackId="1" 
            dataKey={bar.name || bar} 
            fill={bar.color || ThemeColors[idx]} 
            onClick={this.handleClick} 
          />
        );
      });
    }

    // Todo: Receive the width of the SVG component from the container
    return (
      <Card title={title} subtitle={subtitle}>
        <ResponsiveContainer>
          <BarChart
            data={values}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            {...barProps}
          >
            <XAxis dataKey={nameKey || ''} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            {barElements}
            {showLegend !== false &&
              <Legend layout="vertical" align="right" verticalAlign="top" wrapperStyle={{ right: 5 }} />
            }
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }
}