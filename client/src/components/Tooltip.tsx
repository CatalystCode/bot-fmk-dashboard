import * as React from 'react';
import injectTooltip from 'react-md/lib/Tooltips';

const Tooltip = injectTooltip(
  ({children, className, tooltip, ...props }) => (
  <div {...props} className={(className || '') + ' inline-rel-container'} style={{position: 'relative'}}>
    {tooltip}
    {children}
  </div>
));

Tooltip.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.string,
  tooltip: React.PropTypes.node,
};

export default Tooltip;