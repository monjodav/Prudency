import React from 'react';
import { ViewStyle } from 'react-native';
import { Tag } from '@/src/components/ui/Tag';
import type { TagVariant } from '@/src/components/ui/Tag';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const VARIANT_MAP: Record<BadgeVariant, TagVariant> = {
  default: 'neutral',
  success: 'valid',
  warning: 'pending',
  error: 'problem',
  info: 'blue',
};

/** @deprecated Use Tag instead */
export function Badge({ label, variant = 'default', style }: BadgeProps) {
  return <Tag label={label} variant={VARIANT_MAP[variant]} style={style} />;
}
