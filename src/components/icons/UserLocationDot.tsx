import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { ms } from '@/src/utils/scaling';

interface UserLocationDotProps {
  size?: number;
}

export function UserLocationDot({ size = ms(32, 0.4) }: UserLocationDotProps) {
  const center = size / 2;
  const innerRadius = size * 0.28;
  const borderWidth = size * 0.08;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#dd80ff" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#dd80ff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {/* Outer glow */}
      <Circle cx={center} cy={center} r={center} fill="url(#glow)" />
      {/* Inner dot with white border */}
      <Circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="#e08fff"
        stroke="#ffffff"
        strokeWidth={borderWidth}
      />
    </Svg>
  );
}
