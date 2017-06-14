import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import Card from '../Card';
import { RadarChart, Radar, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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

export default class RadarChartCard extends GenericComponent<IRadarProps, IRadarState> {

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

    const domain = 100;

    const data05 = [
      { subject: 'Math', 'NFL': 120, 'NBA': 110, fullMark: domain },
      { subject: 'Chinese', 'NFL': 98, 'NBA': 30, fullMark: domain },
      { subject: 'English', 'NFL': 86, 'NBA': 130, fullMark: domain },
      { subject: 'Geography', 'NFL': 110, 'NBA': 95, fullMark: domain },
      { subject: 'Physics', 'NFL': 102, 'NBA': 90, fullMark: domain },
      { subject: 'History', 'NFL': 65, 'NBA': 85, fullMark: domain },
    ];

    return (
      <Card title={title} subtitle={subtitle}>
        <ResponsiveContainer>
          <RadarChart
            outerRadius={90}
            width={730}
            height={250}
            data={data05}
          >
            <Radar name="NFL" dataKey="NFL" stroke="#00838F" fill="#00838F" fillOpacity={0.6} />
            <Radar name="NBA" dataKey="NBA" stroke="#AD1457" fill="#AD1457" fillOpacity={0.6} />
            <PolarGrid />
            <Legend />
            <PolarAngleAxis dataKey="intent" />
            <PolarRadiusAxis angle={10} domain={[0, domain]} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    );
  }
}