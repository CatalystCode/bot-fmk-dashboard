import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AreaChart, Area as AreaFill, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Tooltip, ResponsiveContainer, Legend, defs } from 'recharts';
import Card from '../Card';
import Switch from 'react-md/lib/SelectionControls/Switch';
import './generic.css';
import colors from '../colors';
var { ThemeColors } = colors;

interface IAreaProps extends IGenericProps {
  theme?: string[];
  showLegend?: boolean;
  isStacked?: boolean;
}

interface IAreaState extends IGenericState {
  timeFormat: string;
  values: Object[];
  lines: Object[];
  isStacked: boolean;
}

export default class Area extends GenericComponent<IAreaProps, IAreaState> {

  static defaultProps = {
    isStacked: true
  };

  dateFormat(time: string) {
    return moment(time).format('MMM-DD');
  }

  hourFormat(time: string) {
    return moment(time).format('HH:mm');
  }

  generateWidgets() {
    let checked = this.is('isStacked');
    return (
      <div className="widgets">
        <Switch
          id="stack"
          name="stack"
          label="Stack"
          checked={checked}
          defaultChecked
          onChange={this.handleStackChange}
        />
      </div>
    );
  }

  handleStackChange = (checked) => {
    // NB: a render workaround is required when toggling stacked area view.
    this.setState({ isStacked: checked, values: this.state.values.slice() });
  }

  render() {
    var { timeFormat, values, lines } = this.state;
    var { title, subtitle, theme, props } = this.props;
    var { showLegend, areaProps } = props;

    var format = timeFormat === 'hour' ? this.hourFormat : this.dateFormat;
    var themeColors = theme || ThemeColors;

    // gets the 'isStacked' boolean option from state, passed props or default values (in that order).
    var isStacked = this.is('isStacked');
    let stackProps = {};
    if (isStacked) {
      stackProps['stackId'] = '1';
    }

    var widgets = this.generateWidgets();

    var fillElements = [];
    if (values && values.length && lines) {
      fillElements = lines.map((line, idx) => {
        return (
          <AreaFill
            key={idx}
            dataKey={line}
            {...stackProps}
            type="monotone"
            stroke={themeColors[idx % themeColors.length]}
            fill={themeColors[idx % themeColors.length]}
          />
        );
      });
    }

    return (
      <Card title={title} subtitle={subtitle}>
        {widgets}
        <ResponsiveContainer>
          <AreaChart
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            data={values}
            {...areaProps}
          >
            <XAxis dataKey="time" tickFormatter={format} minTickGap={20} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            {showLegend !== false && <Legend />}
            {fillElements}
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    );
  }
}