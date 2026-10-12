import React from 'react';

/**
 * Shri Deepaalaya Silks — Typographic Logo Component
 * Uses an inline SVG so it renders correctly with any font and never breaks layout.
 * Replace with <img src="/client-logo.png"> once the client supplies a logo file.
 * NEEDS CLIENT CONFIRMATION: awaiting official logo asset.
 */
const SdsLogo = ({ width = 220, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 72"
    width={width}
    height={width * 72 / 320}
    aria-label="Shri Deepaalaya Silks"
    role="img"
    className={className}
    style={{ flexShrink: 0 }}
  >
    {/* Gold diamond ornament */}
    <g transform="translate(0, 6)">
      <polygon points="11,0 19,8 11,16 3,8" fill="var(--color-gold, #C5A15A)" opacity="0.9" />
      <polygon points="11,3 16,8 11,13 6,8" fill="var(--color-maroon, #6D1734)" />
    </g>

    {/* Primary wordmark */}
    <text
      x="30" y="30"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="22"
      fontWeight="700"
      fill="var(--color-maroon, #6D1734)"
      letterSpacing="0.03em"
    >
      Shri Deepaalaya
    </text>

    {/* Subtitle: SILKS */}
    <text
      x="30" y="52"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="12"
      fontWeight="400"
      fill="var(--color-gold, #C5A15A)"
      letterSpacing="0.26em"
    >
      SILKS
    </text>

    {/* Thin gold rule */}
    <rect x="30" y="58" width="178" height="1" fill="var(--color-gold, #C5A15A)" opacity="0.55" />
  </svg>
);

export default SdsLogo;
