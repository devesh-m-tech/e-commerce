import React from 'react';
import './ShinyText.css';

export const ShinyText = ({
  text,
  disabled = false,
  speed = 4,
  className = '',
  shimmerColor = '#C5A15A'
}) => {
  return (
    <span
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{
        animationDuration: `${speed}s`,
        '--shimmer-color': shimmerColor,
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
