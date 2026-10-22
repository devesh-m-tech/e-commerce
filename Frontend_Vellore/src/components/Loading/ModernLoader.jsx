import React from 'react';
import './ModernLoader.css';

/**
 * ModernLoader — Very Simple Round Loading Spinner
 * Clean, lightweight, centered circular spinner without page-locking hacks.
 */
const ModernLoader = ({
  size = 46,
  inline = false,
  customMessage = '',
  text = '',
  // Pass-through optional props for backward compatibility
  showProgress = false,
  preventScroll = false,
  animationType = 'spin'
}) => {
  const displayMsg = customMessage || (text && text !== 'Shri Deepaalaya Silks' ? text : '');

  return (
    <div className={`modern-discovery-loader ${inline ? 'inline' : ''}`} role="status" aria-label="Loading">
      <div className="sds-simple-round-spinner-wrap">
        <div
          className="sds-simple-round-spinner"
          style={{
            width: typeof size === 'number' ? (size > 10 ? `${size}px` : `${Math.round(size * 46)}px`) : `${size}`
          }}
        />
        {displayMsg ? (
          <p className="sds-simple-round-loader-msg">{displayMsg}</p>
        ) : null}
      </div>
    </div>
  );
};

export default ModernLoader;
