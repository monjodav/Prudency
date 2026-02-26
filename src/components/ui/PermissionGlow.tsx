import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { ms } from '@/src/utils/scaling';

type IconType = 'shield-check' | 'bell';

interface PermissionGlowProps {
  icon: IconType;
  size?: number;
}

function ShieldCheckIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.023} viewBox="0 0 63.87 65.37" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.663 12.196C12.22 12.052 23.334 7.719 31.937 0C40.541 7.72 51.654 12.055 63.212 12.2C63.651 14.795 63.875 17.47 63.875 20.189C63.875 41.048 50.541 58.793 31.937 65.368C13.334 58.789 0 41.044 0 20.185C0 17.462 0.228 14.795 0.663 12.196ZM46.737 26.999C47.464 26.246 47.866 25.238 47.857 24.191C47.848 23.144 47.428 22.143 46.688 21.403C45.948 20.663 44.946 20.243 43.9 20.234C42.853 20.225 41.845 20.627 41.092 21.354L27.945 34.5L22.783 29.339C22.03 28.611 21.022 28.209 19.975 28.218C18.929 28.227 17.927 28.647 17.187 29.387C16.447 30.127 16.027 31.129 16.018 32.175C16.009 33.222 16.411 34.231 17.138 34.984L25.123 42.968C25.871 43.716 26.887 44.137 27.945 44.137C29.004 44.137 30.019 43.716 30.768 42.968L46.737 26.999Z"
        fill="#F1ECF3"
      />
    </Svg>
  );
}

function BellIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.143} viewBox="0 0 55.89 63.87" fill="none">
      <Path
        d="M27.944 0C21.592 0 15.499 2.524 11.007 7.016C6.515 11.508 3.991 17.6 3.991 23.953V38.269L1.169 41.092C0.611 41.65 0.231 42.361 0.077 43.135C-0.077 43.91 0.002 44.712 0.304 45.442C0.606 46.171 1.117 46.794 1.774 47.233C2.43 47.672 3.202 47.906 3.991 47.906H51.898C52.687 47.906 53.459 47.672 54.115 47.233C54.771 46.794 55.283 46.171 55.585 45.442C55.887 44.712 55.966 43.91 55.812 43.135C55.658 42.361 55.278 41.65 54.72 41.092L51.898 38.269V23.953C51.898 17.6 49.374 11.508 44.882 7.016C40.39 2.524 34.297 0 27.944 0ZM27.944 63.875C24.768 63.875 21.722 62.613 19.476 60.367C17.23 58.121 15.968 55.075 15.968 51.898H39.921C39.921 55.075 38.659 58.121 36.413 60.367C34.167 62.613 31.121 63.875 27.944 63.875Z"
        fill="#F1ECF3"
      />
    </Svg>
  );
}

export function PermissionGlow({ icon, size: sizeProp }: PermissionGlowProps) {
  const size = sizeProp ?? ms(180, 0.5);
  const iconSize = size * 0.28;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer blob shape - dark purple */}
      <View style={[StyleSheet.absoluteFill, styles.centered]}>
        <Svg width={size} height={size * 0.98} viewBox="0 0 220 215.4" fill="none">
          <Ellipse cx="110" cy="107.7" rx="110" ry="107.7" fill="#5A356B" opacity={0.7} />
        </Svg>
      </View>

      {/* Middle organic shape - rotated, purple */}
      <View style={[StyleSheet.absoluteFill, styles.centered]}>
        <Svg width={size * 0.7} height={size * 0.685} viewBox="0 0 156.44 153.24" fill="none">
          <Path
            opacity={0.7}
            d="M156.436 72.354C156.436 93.782 138.875 108.509 125.273 122.981C110.519 138.679 94.683 153.237 71.44 153.237C49.602 153.237 27.044 153.594 12.492 139.528C-2.724 124.821 0.231 95.357 0.231 72.524C0.231 47.802 1.649 25.499 19.127 10.663C33.231 -1.308 52.675 0.133 72.623 0.133C91.83 0.133 108.29 -1.835 122.164 9.348C140.556 24.174 156.436 46.89 156.436 72.354Z"
            fill="#CC63F9"
          />
        </Svg>
      </View>

      {/* Inner bright circle - violet */}
      <View style={[StyleSheet.absoluteFill, styles.centered]}>
        <Svg width={size * 0.535} height={size * 0.548} viewBox="0 0 117.53 120.39" fill="none">
          <Ellipse cx="58.763" cy="60.197" rx="58.763" ry="60.197" fill="#CC63F9" />
        </Svg>
      </View>

      {/* Icon */}
      <View style={[StyleSheet.absoluteFill, styles.centered]}>
        {icon === 'shield-check' ? (
          <ShieldCheckIcon size={iconSize} />
        ) : (
          <BellIcon size={iconSize} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
