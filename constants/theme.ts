export type ThemeMode = 'dark' | 'light';

/** Vibrant clay accents (reference UI). */
export const ClayCategory = {
  notes: '#6C5DD3',
  tasks: '#FF6B4A',
  projects: '#FFC107',
  ai: '#14B8A6',
  coral: '#FF6B4A',
  purple: '#6C5DD3',
  yellow: '#FFC107',
  mint: '#2DD4BF',
} as const;

export type ClayTone = 'default' | 'purple' | 'coral' | 'yellow' | 'mint' | 'ai';

const dark = {
  bg: '#0A1210',
  bgElevated: '#101A17',
  bgCard: '#152420',
  bgCardAlt: '#1C3028',
  bgCardDeep: '#0D1614',
  bgGlass: 'rgba(21, 36, 32, 0.94)',
  bgGlassLight: 'rgba(94, 234, 212, 0.06)',

  accent: '#5EEAD4',
  accentDim: 'rgba(94,234,212,0.2)',
  accentSoft: 'rgba(94,234,212,0.1)',
  accentGlow: 'rgba(94,234,212,0.5)',
  accentMid: '#2DD4BF',

  navActive: '#5EEAD4',
  navActiveMid: '#2DD4BF',
  navActiveDim: 'rgba(94,234,212,0.24)',
  navActiveGlow: 'rgba(94,234,212,0.45)',

  pastelMint: '#5EEAD4',
  pastelLavender: '#C4B5FD',
  pastelPeach: '#FDBA74',
  pastelSky: '#7DD3FC',
  pastelRose: '#FDA4AF',

  cyan: '#67E8F9',
  cyanDim: 'rgba(103,232,249,0.16)',
  purple: '#A78BFA',
  purpleDim: 'rgba(167,139,250,0.22)',

  textPrimary: '#F0FDF9',
  textSecondary: '#A7C4BC',
  textMuted: '#6B8F84',
  textAccent: '#5EEAD4',

  danger: '#FB7185',
  dangerDim: 'rgba(251,113,133,0.2)',
  warning: '#FCD34D',
  warningDim: 'rgba(252,211,77,0.18)',
  info: '#7DD3FC',
  infoDim: 'rgba(125,211,252,0.16)',
  success: '#5EEAD4',
  successDim: 'rgba(94,234,212,0.18)',

  priorityHigh: '#FB7185',
  priorityMedium: '#FCD34D',
  priorityLow: '#7DD3FC',
  priorityNone: '#6B8F84',

  border: '#2A4038',
  borderLight: 'rgba(255,255,255,0.06)',
  borderGlow: 'rgba(94,234,212,0.32)',
  borderCyan: 'rgba(103,232,249,0.28)',
  borderNav: 'rgba(94,234,212,0.38)',

  shadowDark: 'rgba(0,0,0,0.75)',
  shadowAccent: 'rgba(94,234,212,0.25)',
  shadowNav: 'rgba(94,234,212,0.4)',

  overlay: 'rgba(8,16,14,0.92)',
  tabBar: '#101A17',
  tabBarBorder: '#2A4038',
  tabBarVein: '#1A2E28',
  starfield: 'rgba(94,234,212,0.15)',

  clayHighlight: 'rgba(255,255,255,0.1)',
  clayShadow: 'rgba(0,0,0,0.55)',

  voiceMic: '#FF6B4A',
  voiceMicGlow: 'rgba(255,107,74,0.45)',
  voiceMicDim: 'rgba(255,107,74,0.2)',
};

/** Light mint base + bold coral / purple / yellow clay cards. */
const light = {
  bg: '#D4EDE4',
  bgElevated: '#E8F7F0',
  bgCard: '#FFFFFF',
  bgCardAlt: '#F0FAF6',
  bgCardDeep: '#C5E6D8',
  bgGlass: 'rgba(255,255,255,0.97)',
  bgGlassLight: 'rgba(255,255,255,0.92)',

  accent: '#0D9488',
  accentDim: 'rgba(13,148,136,0.16)',
  accentSoft: 'rgba(13,148,136,0.08)',
  accentGlow: 'rgba(13,148,136,0.35)',
  accentMid: '#14B8A6',

  navActive: '#0D9488',
  navActiveMid: '#14B8A6',
  navActiveDim: 'rgba(13,148,136,0.18)',
  navActiveGlow: 'rgba(13,148,136,0.32)',

  pastelMint: '#99F6E4',
  pastelLavender: '#DDD6FE',
  pastelPeach: '#FED7AA',
  pastelSky: '#BAE6FD',
  pastelRose: '#FECDD3',

  cyan: '#06B6D4',
  cyanDim: 'rgba(6,182,212,0.14)',
  purple: '#6C5DD3',
  purpleDim: 'rgba(108,93,211,0.18)',

  textPrimary: '#1A2E28',
  textSecondary: '#3D5C52',
  textMuted: '#6B8F84',
  textAccent: '#0D9488',

  danger: '#E11D48',
  dangerDim: 'rgba(225,29,72,0.12)',
  warning: '#D97706',
  warningDim: 'rgba(217,119,6,0.14)',
  info: '#0284C7',
  infoDim: 'rgba(2,132,199,0.12)',
  success: '#059669',
  successDim: 'rgba(5,150,105,0.14)',

  priorityHigh: '#FF6B4A',
  priorityMedium: '#FFC107',
  priorityLow: '#6C5DD3',
  priorityNone: '#94A3B8',

  border: '#B0D4C4',
  borderLight: 'rgba(255,255,255,0.98)',
  borderGlow: 'rgba(13,148,136,0.3)',
  borderCyan: 'rgba(6,182,212,0.28)',
  borderNav: 'rgba(13,148,136,0.32)',

  shadowDark: 'rgba(26,46,40,0.12)',
  shadowAccent: 'rgba(13,148,136,0.2)',
  shadowNav: 'rgba(13,148,136,0.25)',

  overlay: 'rgba(212,237,228,0.94)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#B8D4C8',
  tabBarVein: '#D0EBE2',
  starfield: 'rgba(13,148,136,0.08)',

  clayHighlight: 'rgba(255,255,255,0.98)',
  clayShadow: 'rgba(26,46,40,0.18)',

  voiceMic: '#FF6B4A',
  voiceMicGlow: 'rgba(255,107,74,0.42)',
  voiceMicDim: 'rgba(255,107,74,0.16)',
};

export const Colors = light;

export function getColors(mode: ThemeMode) {
  return mode === 'light' ? light : dark;
}

export function getClayToneColor(tone: ClayTone): string {
  switch (tone) {
    case 'purple':
      return ClayCategory.purple;
    case 'coral':
      return ClayCategory.coral;
    case 'yellow':
      return ClayCategory.yellow;
    case 'mint':
    case 'ai':
      return ClayCategory.ai;
    default:
      return ClayCategory.mint;
  }
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 18,
  md: 26,
  lg: 32,
  xl: 40,
  full: 9999,
};

export const Typography = {
  displayLg: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -1 },
  displayMd: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  displaySm: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  headingLg: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  headingMd: { fontSize: 18, fontWeight: '600' as const },
  headingSm: { fontSize: 16, fontWeight: '600' as const },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  caption: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
};

export const Shadows = {
  clay: {
    shadowColor: '#1A2E28',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 16,
  },
  clayInset: {
    shadowColor: '#1A2E28',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  clayGlow: {
    shadowColor: '#6C5DD3',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  glow: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 28,
    elevation: 16,
  },
  soft: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
  },
  navActive: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 20,
  },
  voice3d: {
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.48,
    shadowRadius: 30,
    elevation: 24,
  },
};
