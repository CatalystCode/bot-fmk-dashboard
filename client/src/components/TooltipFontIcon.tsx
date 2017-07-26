import * as React from 'react';
import FontIcon from 'react-md/lib/FontIcons';
import injectTooltip from 'react-md/lib/Tooltips';

// Material icons shouldn't have any other children other than the child string and
// it gets converted into a span if the tooltip is added, so we add a container
// around the two.
const TooltipFontIcon = injectTooltip(({
  children, iconClassName, className, tooltip, forceIconFontSize, forceIconSize, style, iconStyle, ...props }) => (

  <div {...props} style={style} className={(className || '') + ' inline-rel-container'}>
    {tooltip}
    <FontIcon
      style={iconStyle}
      iconClassName={iconClassName}
      forceFontSize={forceIconFontSize}
      forceSize={forceIconSize}
    >
      {children}
    </FontIcon>
  </div>
));

TooltipFontIcon.propTypes = {
  children: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
  iconClassName: React.PropTypes.string,
  tooltip: React.PropTypes.node,
  forceIconFontSize: React.PropTypes.bool,
  forceIconSize: React.PropTypes.number,
  style: React.PropTypes.object,
  iconStyle: React.PropTypes.object
};

export default TooltipFontIcon;