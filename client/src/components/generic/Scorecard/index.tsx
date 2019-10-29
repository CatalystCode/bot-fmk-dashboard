import * as React from 'react';
import * as _ from 'lodash';

import Card from '../../Card';
import FontIcon from 'react-md/lib/FontIcons';
import Tooltip from '../../Tooltip';

import { GenericComponent, IGenericProps } from '../GenericComponent';
import utils from '../../../utils';

const styles = {
  chevron: {
    float: 'none',
    padding: 0,
    verticalAlign: 'middle'
  } as React.CSSProperties,
  title: {
    margin: 0,
    padding: 0,
  } as React.CSSProperties,
  content: {
    margin: 0,
    padding: 0,
    overflow: 'visible'
  } as React.CSSProperties
};

interface IScorecardProps extends IGenericProps {
  props: {
    scorecardWidth?: number;
    colorPosition?: 'bottom' | 'left';
    subheading?: string;
    onClick?: string;
    tooltip?: string;
  };
}

export default class Scorecard extends GenericComponent<IScorecardProps, any> {

  static fromSource(source: any) {
    if (!source || typeof source !== 'object') { return {}; }

    let mappings = {};
    _.keys(source).forEach(key => {
      mappings['card_' + key + '_value'] = GenericComponent.sourceFormat(source[key], 'value');
      mappings['card_' + key + '_heading'] = GenericComponent.sourceFormat(source[key], 'heading');
      mappings['card_' + key + '_color'] = GenericComponent.sourceFormat(source[key], 'color');
      mappings['card_' + key + '_icon'] = GenericComponent.sourceFormat(source[key], 'icon');
      mappings['card_' + key + '_subvalue'] = GenericComponent.sourceFormat(source[key], 'subvalue');
      mappings['card_' + key + '_subheading'] = GenericComponent.sourceFormat(source[key], 'subheading');
    });
    return mappings;
  }

  constructor(props: IScorecardProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  shortFormatter(num: any): string {
    if (!num && num !== 0) { return ''; }
    if (isNaN(num)) { return num; }

    return utils.kmNumber(num);
  }

  render() {
    let { values, value, icon, subvalue, color, className } = this.state;
    let { id, title, props, actions } = this.props;
    let { subheading, colorPosition, scorecardWidth, onClick, tooltip } = props;

    if (_.has(this.state, 'values')) {
      // In case the user defined a "values" parameter

    } else if (_.has(this.state, 'value')) {
      // If not, check the user defined a "value" parameter
      value = (value || '').toString();
      values = [
        {
          value: value || 0,
          icon: icon,
          heading: title,
          subvalue: subvalue,
          subheading: subheading,
          color: color,
          onClick: onClick
        }
      ];

    } else {
      // Checking for dynamic card content like card_cardName_value, card_cardName_heading, ...
      let dynamicCards = {};
      Object.keys(this.state).map(key => {
        if (key.startsWith('card_')) {
          let key1 = key.substr('card_'.length);
          if (key1.indexOf('_') > 0 && key1.length > key1.indexOf('_')) {
            var cardName = key1.substr(0, key1.indexOf('_'));
            var cardValue = key1.substr(key1.indexOf('_') + 1);
            dynamicCards[cardName] = dynamicCards[cardName] || {};
            dynamicCards[cardName][cardValue] = this.state[key];
          }
        }
      });

      values = Object.keys(dynamicCards).map(key => dynamicCards[key]);
    }

    var cards = (values || []).map((val, idx) =>
      this.valueToCard(val, idx, className, colorPosition, scorecardWidth));

    return (
      <Card id={id} title={title} hideTitle={true} titleStyle={styles.title} contentStyle={styles.content}>
        <div className="md-grid--no-spacing md-card-scorecard">
          {cards}
        </div>
      </Card>
    );
  }

  handleClick(value: {onClick: string}, proxy: any) {
    if (value && value.onClick && _.isEmpty(this.props.actions)) {
      return;
    }

    let eventObject = typeof event !== 'undefined' && event || arguments[2];
    eventObject.preventDefault();

    var { title } = this.props || '' as any;
    var args = { ...value };
    this.trigger(value.onClick, args);
  }

  private valueToCard(value: any, idx: number, className: string, colorPosition: string, scorecardWidth: number) {
    let style = {};
    if (scorecardWidth) {
      style['width'] = scorecardWidth;
    }

    let colorStyle = {};
    let cardstyle = _.extend({}, style);
    let color = value.color || '';
    let icon = value.icon;
    let iconStyle = icon && { color };
    let onClick = value.onClick;

    let chevronStyle = _.extend({}, styles.chevron);
    chevronStyle['color'] = color;

    if (!icon || colorPosition) {
      if (!colorPosition || colorPosition === 'bottom') { colorStyle['borderColor'] = color; }
      if (colorPosition === 'left') { cardstyle['borderColor'] = color; }
    }

    const drillDownLink = onClick ? (
      <div className="md-subheading-2" style={{ color: color }}>
        {value.heading}
        <FontIcon style={chevronStyle}>chevron_right</FontIcon>
      </div>)
      : <div className="md-subheading-2">{value.heading}</div>;

    let cardClassName = `scorecard${onClick ? ' clickable-card' : ''}${colorPosition ? ` color-${colorPosition}` : ''}`;
    return (
      <Tooltip 
        key={idx} 
        className={cardClassName} 
        style={cardstyle} 
        onClick={this.handleClick.bind(this, value)} 
        tooltipLabel={value.tooltip} 
        tooltipPosition="top"
      >
        {icon && <FontIcon className={className} style={iconStyle}>{icon}</FontIcon>}
        <div className="md-headline">{this.shortFormatter(value.value)}</div>
        {drillDownLink}
        {
          (value.subvalue || value.subheading) &&
          (
            <div className="scorecard-subheading" style={colorStyle}>
              <b>{this.shortFormatter(value.subvalue)}</b>
              {value.subheading}
            </div>
          )
        }
      </Tooltip>
    );
  }
}