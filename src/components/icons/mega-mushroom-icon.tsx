
import React from 'react';

export function MegaMushroomIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mega-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FF8A80" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF5252" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow Effect */}
      <circle cx="24" cy="24" r="22" fill="url(#mega-glow)" />
      {/* Mushroom Stem */}
      <rect x="16" y="26" width="16" height="16" rx="8" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="2" />
      {/* Mushroom Cap */}
      <path 
        d="M8 28C8 16.9543 16.9543 8 28 8C39.0457 8 48 16.9543 48 28" 
        transform="translate(-4, 0)"
        fill="#FF5252" 
        stroke="#D32F2F" 
        strokeWidth="2.5" 
      />
      {/* Spots */}
      <circle cx="15" cy="18" r="4" fill="white" stroke="#E0E0E0" strokeWidth="1"/>
      <circle cx="28" cy="15" r="5" fill="white" stroke="#E0E0E0" strokeWidth="1"/>
      <circle cx="37" cy="22" r="3" fill="white" stroke="#E0E0E0" strokeWidth="1"/>
      {/* Eyes */}
      <circle cx="21" cy="34" r="2.5" fill="black" />
      <circle cx="31" cy="34" r="2.5" fill="black" />
    </svg>
  );
}
