import React from 'react';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { ms } from '@/src/utils/scaling';

interface UserLocationDotProps {
  size?: number;
  heading?: number | null;
}

export function UserLocationDot({ size = ms(32, 0.4), heading }: UserLocationDotProps) {
  const center = size / 2;
  const innerRadius = size * 0.28;
  const borderWidth = size * 0.08;
  const showHeading = heading != null && heading >= 0;

  const coneLength = size * 0.48;
  const coneHalfAngle = 25;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const leftAngle = toRad(-90 - coneHalfAngle);
  const rightAngle = toRad(-90 + coneHalfAngle);
  const lx = center + coneLength * Math.cos(leftAngle);
  const ly = center + coneLength * Math.sin(leftAngle);
  const rx = center + coneLength * Math.cos(rightAngle);
  const ry = center + coneLength * Math.sin(rightAngle);
  const conePath = `M ${center} ${center} L ${lx} ${ly} A ${coneLength} ${coneLength} 0 0 1 ${rx} ${ry} Z`;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={showHeading ? { transform: [{ rotate: `${heading}deg` }] } : undefined}
    >
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#dd80ff" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#dd80ff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {/* Direction cone */}
      {showHeading && (
        <Path d={conePath} fill="#dd80ff" opacity={0.35} />
      )}
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
