import React, { useState } from 'react';
import logoImg from '../../assets/shri_deepaalaya_silks_logo.jpg';

/**
 * Shri Deepaalaya Silks — Official Brand Logo Emblem
 * Pure iconic emblem mark with zero text.
 */
const SdsLogo = ({ width = 48, size, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  // Optimal emblem dimension for navbar / headers
  const dimension = size || (typeof width === 'number' && width > 60 ? 50 : (width || 48));

  if (!imgError) {
    return (
      <img
        src={logoImg}
        alt="Shri Deepaalaya Silks Emblem"
        className={`sds-brand-logo ${className}`}
        style={{
          width: `${dimension}px`,
          height: `${dimension}px`,
          aspectRatio: '1',
          objectFit: 'contain',
          display: 'block',
          mixBlendMode: 'multiply',
          borderRadius: '50%',
          flexShrink: 0,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={dimension}
      height={dimension}
      aria-label="Shri Deepaalaya Silks Emblem"
      role="img"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="#C5A15A" strokeWidth="2.5" />
      <polygon points="50,15 64,36 50,57 36,36" fill="#C5A15A" opacity="0.9" />
      <polygon points="50,23 59,36 50,49 41,36" fill="#6D1734" />
      <circle cx="50" cy="68" r="8" fill="#C5A15A" />
      <circle cx="50" cy="68" r="5" fill="#6D1734" />
    </svg>
  );
};

export default SdsLogo;
