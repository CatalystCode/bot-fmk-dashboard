import * as React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';

import Card from '../../Card';
import ResponsiveContainer from '../../ResponsiveContainer';
import { GenericComponent, IGenericProps, IGenericState } from '../GenericComponent';
import { PieChart, Pie, Sector, Cell, Legend } from 'recharts';

import colors from '../../colors';
const { ThemeColors } = colors;

interface IPieProps extends IGenericProps {
  props: {
    pieProps: { [key: string]: Object };
    width: Object;
    height: Object;
    showLegend: boolean;
    legendVerticalAlign?: 'top' | 'bottom';
    compact?: boolean;
    entityType?: string;
  };
  theme?: string[];
}

interface IPieState extends IGenericState {
  activeIndex?: number;
  values?: Object[];
}

export default class PieData extends GenericComponent<IPieProps, IPieState> {

  state = {
    activeIndex: 0,
    values: null
  };

  static fromSource(source: string) {
    return {
      values: GenericComponent.sourceFormat(source, 'pieData')
    };
  }

  constructor(props: any) {
    super(props);

    this.onPieEnter = this.onPieEnter.bind(this);
    this.renderActiveShape = this.renderActiveShape.bind(this);
  }

  onPieEnter(data: any, index: number) {
    this.setState({ activeIndex: index });
  }

  renderActiveShape = (props) => {
    const { entityType } = this.props.props || { entityType: '' };
    const compact = this.props && this.props.props && this.props.props.compact;
    
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

    var text = compact
    ? [<text key={0} x={cx} y={cy} dy={-15} textAnchor="middle" fill={fill} style={{ fontWeight: 500 }}>{name}</text>,
       <text key={1} x={cx} y={cy} dy={3} textAnchor="middle" fill={fill}>{`${value} ${entityType}`}</text>,
       <text key={2} x={cx} y={cy} dy={25} textAnchor="middle" fill="#999">{`(${(percent * 100).toFixed(2)}%)`}</text>]
    : [<text key={3} x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{name}</text>];

    return (
      <g>
        {text}
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
          <path key={0} d={`M${c.sx},${c.sy}L${c.mx},${c.my}L${c.ex},${c.ey}`} stroke={fill} fill="none" />,
          <circle key={1} cx={c.ex} cy={c.ey} r={2} fill={fill} stroke="none" />,
          (
            <text key={2} x={c.ex + (c.cos >= 0 ? 1 : -1) * 12} y={c.ey} textAnchor={c.textAnchor} fill="#333">
              {`${value} ${entityType}`}
            </text>
          ),
          (
            <text key={3} x={c.ex + (c.cos >= 0 ? 1 : -1) * 12} y={c.ey} dy={18} textAnchor={c.textAnchor} fill="#999">
              {`(Rate ${(percent * 100).toFixed(2)}%)`}
            </text>
          )
        ])}
      </g>
    );
  }

  render() {
    var { values } = this.state;
    var { id, props, title, subtitle, layout, theme } = this.props;
    var { pieProps, showLegend, legendVerticalAlign } = props;

    if (!values) {
      return null;
    }

    let themeColors = theme || ThemeColors;
    let layoutHeight = layout && layout.h || 100;
    let layoutWidth = layout && layout.w || 100;

    return (
      <Card id={id} title={title} subtitle={subtitle}>
        <ResponsiveContainer layout={layout}>
          <PieChart>
            <Pie
              data={values}
              cx={Math.min(layoutHeight / 4, layoutWidth) * 70}
              innerRadius={60}
              fill="#8884d8"
              onMouseEnter={this.onPieEnter}
              activeIndex={this.state.activeIndex}
              activeShape={this.renderActiveShape}
              paddingAngle={0}
              {...pieProps}
            >
              {values.map((entry, index) => <Cell key={index} fill={themeColors[index % themeColors.length]} />)}
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