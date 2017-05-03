import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import * as moment from 'moment';
import * as _ from 'lodash';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../Card';

import Button from 'react-md/lib/Buttons/Button';

import colors from '../colors';
var { ThemeColors } = colors;

interface ITimelineProps extends IGenericProps {
  theme?: string[];
}

interface ITimelineState extends IGenericState {
  timeFormat: string;
  values: Object[];
  lines: Object[];
}

export default class Timeline extends GenericComponent<ITimelineProps, ITimelineState> {

  dateFormat(time: string) {
    return moment(time).format('MMM-DD');
  }

  hourFormat(time: string) {
    return moment(time).format('HH:mm');
  }

  render() {
    var { timeFormat, values, lines } = this.state;
    var { title, subtitle, theme, props } = this.props;
    var { lineProps } = props;

    var format = timeFormat === 'hour' ? this.hourFormat : this.dateFormat;
    var themeColors = theme || ThemeColors;

    var lineElements = [];
    if (values && values.length && lines) {
      lineElements = lines.map((line, idx) => {
        return (
          <Line
            key={idx}
            type="monotone"
            dataKey={line}
            stroke={themeColors[idx % themeColors.length]}
            dot={false}
            ticksCount={5}
          />
        );
      });
    }

    return (
      <Card title={title} subtitle={subtitle}>
        <ResponsiveContainer>
          <LineChart data={values} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} {...lineProps}>
            <XAxis dataKey="time" tickFormatter={format} minTickGap={20} />
            <YAxis type="number" domain={['dataMin', 'dataMax']} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            {lineElements}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  }
}