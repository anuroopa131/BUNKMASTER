import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../styles/theme';

/**
 * Signature element of the dashboard: an animated circular gauge with a
 * violet gradient stroke. Fills from 0 to the actual percentage on mount
 * so it always reads as "live data," not a static decoration.
 *
 * size: outer diameter in px
 * status: 'safe' | 'warning' | 'critical' — tints the stroke color
 */
const STATUS_COLOR = {
  safe: tokens.success,
  warning: tokens.warning,
  critical: tokens.critical,
};

const AttendanceRing = ({ percentage = 0, size = 180, thickness = 14, status = 'safe', label, gradientId }) => {
  const [animatedPct, setAnimatedPct] = useState(0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const gid = gradientId || `ring-gradient-${size}`;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedPct(percentage));
    return () => cancelAnimationFrame(raf);
  }, [percentage]);

  const offset = circumference - (Math.min(animatedPct, 100) / 100) * circumference;
  const useStatusColor = status !== 'safe';

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tokens.ringGradientFrom} />
            <stop offset="100%" stopColor={tokens.ringGradientTo} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tokens.border}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={useStatusColor ? STATUS_COLOR[status] : `url(#${gid})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            fontSize: size * 0.2,
            color: tokens.ink,
            lineHeight: 1,
          }}
        >
          {Math.round(percentage)}%
        </Typography>
        {label && (
          <Typography sx={{ fontSize: size * 0.065, color: tokens.inkSoft, mt: 0.5, fontWeight: 500 }}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AttendanceRing;