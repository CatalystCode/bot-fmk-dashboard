import * as React from 'react';
import { Media } from 'react-md/lib/Media';
import { Card, CardTitle } from 'react-md/lib/Cards';
import TooltipFontIcon from './TooltipFontIcon';
import Button from 'react-md/lib/Buttons';

export default ({children = {}, title = '', subtitle = ''}) => {
  const titleNode = <span key={0}>{title}</span>;
  const tooltipNode = (
    <TooltipFontIcon 
        key={1}
        tooltipLabel={subtitle} 
        tooltipPosition="top" 
        forceIconFontSize={true} 
        forceIconSize={16} 
        className="card-icon"
    >
      info
    </TooltipFontIcon>
  );

  return (
    <Card>
      <CardTitle title={''} subtitle={[titleNode, tooltipNode]} />
      <Media>
        {children}
      </Media>
    </Card>
  );
};