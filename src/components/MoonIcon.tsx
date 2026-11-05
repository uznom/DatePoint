import React, { useId } from 'react';
import { MoonPhaseCategory } from '../types';

interface MoonIconProps {
  category: MoonPhaseCategory;
  illuminationPct: number;
  elongationDeg?: number;
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const MoonIcon: React.FC<MoonIconProps> = ({
  category,
  illuminationPct,
  elongationDeg,
  size = 20,
  className = '',
  showGlow = false,
}) => {
  const uniqueId = useId().replace(/:/g, '');

  // Determine elongation in degrees if not directly passed
  let deg = elongationDeg;
  if (deg === undefined) {
    const isWax = category.startsWith('waxing') || category === 'first-quarter';
    const angleFromIllum = Math.acos(1 - (2 * illuminationPct) / 100) * (180 / Math.PI);
    deg = isWax ? angleFromIllum : 360 - angleFromIllum;
  }

  const isFull = illuminationPct >= 98 || category === 'full';
  const isNew = illuminationPct <= 2 || category === 'new';
  const isWaxing = deg > 0 && deg < 180;

  // Arc math for astronomical terminator
  const r = 9.5;
  const cx = 12;
  const cy = 12;
  const theta = (deg * Math.PI) / 180;
  const rx = Math.max(0.01, r * Math.abs(Math.cos(theta))).toFixed(2);
  const topY = (cy - r).toFixed(1);
  const botY = (cy + r).toFixed(1);

  let pathD = '';
  if (!isFull && !isNew) {
    if (isWaxing) {
      if (illuminationPct < 50) {
        // Waxing Crescent: illuminated right half, terminator curved inward
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 1 ${cx} ${botY} A ${rx} ${r} 0 0 0 ${cx} ${topY} Z`;
      } else {
        // Waxing Gibbous: illuminated right half, terminator bulges into left half
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 1 ${cx} ${botY} A ${rx} ${r} 0 0 1 ${cx} ${topY} Z`;
      }
    } else {
      if (illuminationPct >= 50) {
        // Waning Gibbous: illuminated left half, terminator bulges into right half
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 0 ${cx} ${botY} A ${rx} ${r} 0 0 0 ${cx} ${topY} Z`;
      } else {
        // Waning Crescent: illuminated left half, terminator curved inward
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 0 ${cx} ${botY} A ${rx} ${r} 0 0 1 ${cx} ${topY} Z`;
      }
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-110 duration-200"
      >
        <defs>
          <radialGradient id={`glow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`light-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="65%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id={`dark-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {showGlow && isFull && (
          <circle cx="12" cy="12" r="11" fill={`url(#glow-${uniqueId})`} opacity="0.6" />
        )}

        {/* Base dark celestial body */}
        <circle cx="12" cy="12" r={r} fill={`url(#dark-${uniqueId})`} stroke="#334155" strokeWidth="0.8" />

        {/* Subtle lunar maria crater markings on dark side */}
        <circle cx="9" cy="8.5" r="1.1" fill="#0F172A" opacity="0.6" />
        <circle cx="14" cy="14.5" r="1.6" fill="#0F172A" opacity="0.5" />
        <circle cx="14.5" cy="9" r="0.9" fill="#0F172A" opacity="0.5" />

        {/* Illuminated portion */}
        {isFull ? (
          <g>
            <circle cx="12" cy="12" r={r} fill={`url(#light-${uniqueId})`} />
            {/* Crater shadows on illuminated full moon */}
            <circle cx="10" cy="9" r="1.5" fill="#CA8A04" opacity="0.25" />
            <circle cx="14" cy="14" r="2.2" fill="#CA8A04" opacity="0.2" />
            <circle cx="15" cy="8" r="1.2" fill="#CA8A04" opacity="0.2" />
            <circle cx="8" cy="14" r="1.1" fill="#CA8A04" opacity="0.25" />
          </g>
        ) : isNew ? (
          // Dashed silver ring for new moon
          <circle cx="12" cy="12" r={r} stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="1.5 1.5" fill="none" />
        ) : (
          <path d={pathD} fill={`url(#light-${uniqueId})`} />
        )}
      </svg>
    </div>
  );
};
