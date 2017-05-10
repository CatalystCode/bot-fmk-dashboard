import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import Card from '../Card';
import { PieChart, Pie, Sector, Cell, Legend, ResponsiveContainer } from 'recharts';

import * as _ from 'lodash';
import * as moment from 'moment';

import colors from '../colors';
var { ThemeColors } = colors;

interface IPieProps extends IGenericProps {
  mode: string; // users/messages
  props: {
    pieProps: { [key: string]: Object };
    width: Object;
    height: Object;
    showLegend: boolean;
    legendVerticalAlign?: 'top' | 'bottom';
    compact?: boolean;
  };
  theme?: string[];
};

interface IPieState extends IGenericState {
  activeIndex?: number;
  values?: Object[];
}

export default class PieData extends GenericComponent<IPieProps, IPieState> {

  state = {
    activeIndex: 0,
    values: null
  };

  constructor(props: any) {
    super(props);

    this.onPieEnter = this.onPieEnter.bind(this);
  }

  onPieEnter(data: any, index: number) {
    this.setState({ activeIndex: index });
  }

  renderActiveShape = (props) => {
    const { mode } = this.props;
    const compact = this.props && this.props.props && this.props.props.compact;
    var type = mode === 'users' ? 'Users' : 'Messages';

    const RADIAN = Math.PI / 180;
    const { name, cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    var c: any = {};
    c.midAngle = 54.11764705882353;
    c.sin = Math.sin(-RADIAN * c.midAngle);
    c.cos = Math.cos(-RADIAN * c.midAngle);
    c.cx = cx;
    c.cy = cy;
    c.sx = cx + (outerRadius + 10) * c.cos;
    c.sy = cy + (outerRadius + 10) * c.sin;
    c.mx = cx + (outerRadius + 30) * c.cos;
    c.my = cy + (outerRadius + 30) * c.sin;
    c.ex = c.mx + (c.cos >= 0 ? 1 : -1) * 22;
    c.ey = c.my;
    c.textAnchor = 'start';

    return (
      <g>
        {compact && [
          <text x={cx} y={cy} dy={-15} textAnchor="middle" fill={fill} style={{ fontWeight: 500 }}>{name}</text>,
          <text x={cx} y={cy} dy={3} textAnchor="middle" fill={fill}>{`${value} ${type.toLowerCase()}`}</text>,
          <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#999">{`(${(percent * 100).toFixed(2)}%)`}</text>
        ] || [
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{name}</text>,
          ]}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={c.cx}
          cy={c.cy}
          startAngle={compact ? startAngle : 300}
          endAngle={compact ? endAngle : 60}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />

        {!compact && ([
          <path d={`M${c.sx},${c.sy}L${c.mx},${c.my}L${c.ex},${c.ey}`} stroke={fill} fill="none" />,
          <circle cx={c.ex} cy={c.ey} r={2} fill={fill} stroke="none" />,
          (
            <text x={c.ex + (c.cos >= 0 ? 1 : -1) * 12} y={c.ey} textAnchor={c.textAnchor} fill="#333">
              {`${value} ${type.toLowerCase()}`}
            </text>
          ),
          (
            <text x={c.ex + (c.cos >= 0 ? 1 : -1) * 12} y={c.ey} dy={18} textAnchor={c.textAnchor} fill="#999">
              {`(Rate ${(percent * 100).toFixed(2)}%)`}
            </text>
          )
        ])}
      </g>
    );
  }

  render() {
    var { values } = this.state;
    var { props, title, subtitle, layout, theme } = this.props;
    var { pieProps, showLegend, legendVerticalAlign } = props;

    if (!values) {
      return null;
    }

    var themeColors = theme || ThemeColors;

    // Todo: Receive the width of the SVG component from the container
    return (
      <Card title={title} subtitle={subtitle}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={values}
              cx={Math.min(layout.h / 4, layout.w) * 70}
              innerRadius={60}
              fill="#8884d8"
              onMouseEnter={this.onPieEnter}
              activeIndex={this.state.activeIndex}
              activeShape={this.renderActiveShape.bind(this)}
              paddingAngle={0}
              {...pieProps}
            >
              {values.map((entry, index) => <Cell key={index} fill={themeColors[index % themeColors.length]} />)}
              <Cell key={100} fill={colors.GoodColor} />
              <Cell key={101} fill={colors.BadColor} />
            </Pie>
            {
              showLegend !== false && (
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign={legendVerticalAlign || 'top'}
                  wrapperStyle={{ paddingBottom: 10 }}
                />
              )
            }
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  }
}