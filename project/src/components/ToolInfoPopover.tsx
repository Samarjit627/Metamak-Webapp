// ToolInfoPopover.tsx
import React from 'react';

interface ToolInfoPopoverProps {
  toolName: string;
  description: string;
}

const ToolInfoPopover: React.FC<ToolInfoPopoverProps> = ({ toolName, description }) => (
  <div className="popover">
    <h4>{toolName}</h4>
    <p>{description}</p>
  </div>
);

export default ToolInfoPopover;
