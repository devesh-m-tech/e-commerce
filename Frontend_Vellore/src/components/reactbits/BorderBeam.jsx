import React from 'react';
import './BorderBeam.css';

export const BorderBeam = ({
  className = '',
  duration = 8,
  borderWidth = 2,
  colorFrom = '#f6d365',
  colorTo = '#d4af37',
  reverse = false,
  ...props
}) => {
  return (
    <div
      className={`border-beam-container ${className}`}
      style={{
        '--border-width': `${borderWidth}px`,
        '--beam-duration': `${duration}s`,
        '--beam-direction': reverse ? 'reverse' : 'normal',
        '--beam-color-1': colorFrom,
        '--beam-color-2': colorTo,
      }}
      aria-hidden="true"
      {...props}
    >
      <div className="border-beam-spinner" />
    </div>
  );
};

export default BorderBeam;
