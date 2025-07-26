
import React from 'react';

export function ItemBoxIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rainbow-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF0000' }} />
          <stop offset="16.66%" style={{ stopColor: '#FF7F00' }} />
          <stop offset="33.33%" style={{ stopColor: '#FFFF00' }} />
          <stop offset="50%" style={{ stopColor: '#00FF00' }} />
          <stop offset="66.66%" style={{ stopColor: '#0000FF' }} />
          <stop offset="83.33%" style={{ stopColor: '#4B0082' }} />
          <stop offset="100%" style={{ stopColor: '#8B00FF' }} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#FDE047" stroke="url(#rainbow-border)" strokeWidth="4" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#A16207"
        fontSize="28"
        fontFamily="Poppins, sans-serif"
        fontWeight="bold"
      >
        ?
      </text>
    </svg>
  );
}
