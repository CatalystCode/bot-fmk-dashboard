import * as React from 'react';
import * as _ from 'lodash';

import { Media } from 'react-md/lib/Media';
import { Card } from 'react-md/lib/Cards';
import FontIcon from 'react-md/lib/FontIcons';

import { GenericComponent, IGenericProps } from '../GenericComponent';
import utils from '../../../utils';

import settings from './Settings';

const styles = {
  chevron: {
    float: 'none',
    padding: 0,
    verticalAlign: 'middle'
  }
};

interface IScorecardProps extends IGenericProps {
  props: {
    scorecardWidth?: number;
    colorPosition?: 'bottom' | 'left';
    subheading?: string;
    onClick?: string;
  };
}

export default class Scorecard extends GenericComponent<IScorecardProps, any> {

  static editor = settings;

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
    let { title, props, actions } = this.props;
    let { subheading, colorPosition, scorecardWidth, onClick } = props;

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
      <Card>
        <Media className="md-card-scorecard">
          <div className="md-grid--no-spacing">
            {cards}
          </div>
        </Media>
      </Card>
    );
  }

  handleClick(value: {onClick: string}, proxy: any) {
    if (value && value.onClick && _.isEmpty(this.props.actions)) {
      return;
    }

    event.preventDefault();
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
      <div key={idx} className={cardClassName} style={cardstyle} onClick={this.handleClick.bind(this, value)}>
        {
          icon && <FontIcon className={className} style={iconStyle}>{icon}</FontIcon>}
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
      </div>
    );
  }
}