import React from 'react';
import { ViewStyle } from 'react-native';
import { ms } from '@/src/utils/scaling';
import { colors } from '@/src/theme/colors';
import { CircularLoader } from './loaders';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  size?: LoaderSize;
  color?: string;
  style?: ViewStyle;
}

const SIZE_MAP: Record<LoaderSize, number> = {
  sm: ms(20, 0.4),
  md: ms(28, 0.4),
  lg: ms(36, 0.4),
};

const STROKE_MAP: Record<LoaderSize, number> = {
  sm: 2.5,
  md: 3,
  lg: 3.5,
};

export function Loader({ size = 'md', color = colors.primary[400], style }: LoaderProps) {
  return (
    <CircularLoader
      size={SIZE_MAP[size]}
      strokeWidth={STROKE_MAP[size]}
      activeColor={color}
      style={style}
    />
  );
}
