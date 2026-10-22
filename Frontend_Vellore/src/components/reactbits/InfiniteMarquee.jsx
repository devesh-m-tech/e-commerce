import React from 'react';
import './InfiniteMarquee.css';

export const InfiniteMarquee = ({
  children,
  speed = 35,
  direction = 'left',
  pauseOnHover = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`infinite-marquee-wrapper ${pauseOnHover ? 'pause-hover' : ''} ${className}`}
      style={{
        '--marquee-duration': `${speed}s`,
        '--marquee-direction': direction === 'right' ? 'reverse' : 'normal',
      }}
      {...props}
    >
      <div className="infinite-marquee-track">
        <div className="infinite-marquee-content">{children}</div>
        <div className="infinite-marquee-content" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
};

export default InfiniteMarquee;
