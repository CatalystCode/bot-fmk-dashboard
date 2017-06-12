import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import Card from '../Card';
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from 'recharts';

import * as _ from 'lodash';
import * as moment from 'moment';

import colors from '../colors';
var { ThemeColors } = colors;

interface IRadarProps extends IGenericProps {
  props: {

    nameKey: string;
  };
};

interface IRadarState extends IGenericState {
  values: Object[];
}

export default class SimpleRadialBarChartCard extends GenericComponent<IRadarProps, IRadarState> {

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

    var { values } = this.state;
    var { title, subtitle, props } = this.props;

    if (!values) {
      return null;
    }

    const style = {
      top: 0,
      left: 350,
      lineHeight: '24px'
    };

    const data = [
      { name: 'alarm.set', uv: 31.47, pv: 2400, fill: '#8884d8' },
      { name: '*:/', uv: 26.69, pv: 4567, fill: '#83a6ed' },
      { name: 'none', uv: 15.69, pv: 1398, fill: '#8dd1e1' },
      { name: 'invalid property type object', uv: 8.22, pv: 9800, fill: '#82ca9d' }
    ];

    return (
      <Card title={title} subtitle={subtitle}>
        <ResponsiveContainer>
          <RadialBarChart
            width={500}
            height={300}
            cx={150}
            cy={150}
            innerRadius={20}
            outerRadius={140}
            barSize={10}
            data={data}
          >
            <RadialBar minAngle={15} label background clockWise={true} dataKey="uv" />
            <Legend
              iconSize={10}
              width={120}
              height={140}
              layout="vertical"
              verticalAlign="middle"
              wrapperStyle={style}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </Card>
    );
  }
}