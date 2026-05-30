import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type MicIconProps = {
  size?: number;
  color?: string;
};

/** Clay-style microphone icon (SVG). */
export function MicIcon({ size = 28, color = '#FFFFFF' }: MicIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="3" width="6" height="11" rx="3" fill={color} />
      <Path
        d="M6 11a6 6 0 0 0 12 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path d="M12 17v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8 21h8" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="12" cy="8" r="1.5" fill={color} opacity={0.35} />
    </Svg>
  );
}

export function MicStopIcon({ size = 22, color = '#FFFFFF' }: MicIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="7" y="7" width="10" height="10" rx={2} fill={color} />
    </Svg>
  );
}
