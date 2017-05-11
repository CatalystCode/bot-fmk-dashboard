import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ScatterChart, Scatter as ScatterLine, XAxis, YAxis, ZAxis, CartesianGrid } from 'recharts';
import { Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../Card';
import colors from '../colors';
var { ThemeColors } = colors;

interface IScatterProps extends IGenericProps {
  theme?: string[];
  xDataKey?: string;
  yDataKey?: string;
  zDataKey?: string;
  zRange?: number[];
}

interface IScatterState extends IGenericState {

}

export default class Scatter extends GenericComponent<IScatterProps, IScatterState> {

  static defaultProps = {
    xDataKey: 'x',
    yDataKey: 'y',
    zDataKey: 'z',
    zRange: [10, 1000]
  };

  render() {
    var { groupedValues } = this.state;
    var { title, subtitle, theme, props } = this.props;
    var { scatterProps, groupTitles } = props;

    var { xDataKey, yDataKey, zDataKey, zRange } = this.props.props;
    if (xDataKey === undefined) { xDataKey = Scatter.defaultProps.xDataKey; }
    if (yDataKey === undefined) { yDataKey = Scatter.defaultProps.yDataKey; }
    if (zDataKey === undefined) { zDataKey = Scatter.defaultProps.zDataKey; }
    if (zRange === undefined) { zRange = Scatter.defaultProps.zRange; }

    var themeColors = theme || ThemeColors;

    let scatterLines = [];
    let idx = 0;
    if (groupedValues) {
      Object.keys(groupedValues).forEach((key) => {
        if (!key) {
          return;
        }
        let values = groupedValues[key];
        let line = (
          <ScatterLine
            key={idx}
            name={key}
            data={values}
            fill={themeColors[idx % themeColors.length]}
            stroke={themeColors[idx % themeColors.length]}
          />
        );
        scatterLines.push(line);
        idx += 1;
      });
    }

    return (
      <Card title={title} subtitle={subtitle}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }} {...scatterProps}>
            <XAxis dataKey={xDataKey} />
            <YAxis dataKey={yDataKey} />
            <ZAxis dataKey={zDataKey} range={zRange} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {scatterLines}
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    );
  }
}