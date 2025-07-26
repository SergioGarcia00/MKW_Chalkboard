
import React from 'react';

export function GoldenMushroomIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      {/* Mushroom Cap */}
      <path 
        d="M10 24C10 16.268 16.268 10 24 10C31.732 10 38 16.268 38 24" 
        fill="url(#gold-gradient)" 
        stroke="#DAA520" 
        strokeWidth="2" 
      />
      {/* Mushroom Stem */}
      <rect x="18" y="24" width="12" height="14" rx="6" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="20" cy="20" r="2" fill="black" />
      <circle cx="28" cy="20" r="2" fill="black" />
    </svg>
  );
}

    