export type ThemeMode = 'dark' | 'light';

const dark = {
  bg: '#0E0E14',
  bgElevated: '#14141C',
  bgCard: '#1A1A24',
  bgCardAlt: '#22222E',
  bgCardDeep: '#12121A',
  bgGlass: 'rgba(26, 26, 36, 0.92)',
  bgGlassLight: 'rgba(255,255,255,0.06)',

  accent: '#5EEAD4',
  accentDim: 'rgba(94,234,212,0.18)',
  accentSoft: 'rgba(94,234,212,0.08)',
  accentGlow: 'rgba(94,234,212,0.45)',
  accentMid: '#2DD4BF',

  navActive: '#5EEAD4',
  navActiveMid: '#2DD4BF',
  navActiveDim: 'rgba(94,234,212,0.22)',
  navActiveGlow: 'rgba(94,234,212,0.45)',

  pastelMint: '#5EEAD4',
  pastelLavender: '#C4B5FD',
  pastelPeach: '#FDBA74',
  pastelSky: '#7DD3FC',
  pastelRose: '#FDA4AF',

  cyan: '#67E8F9',
  cyanDim: 'rgba(103,232,249,0.16)',
  purple: '#A78BFA',
  purpleDim: 'rgba(167,139,250,0.18)',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textAccent: '#5EEAD4',

  danger: '#FB7185',
  dangerDim: 'rgba(251,113,133,0.18)',
  warning: '#FCD34D',
  warningDim: 'rgba(252,211,77,0.16)',
  info: '#7DD3FC',
  infoDim: 'rgba(125,211,252,0.16)',
  success: '#5EEAD4',
  successDim: 'rgba(94,234,212,0.16)',

  priorityHigh: '#FB7185',
  priorityMedium: '#FCD34D',
  priorityLow: '#7DD3FC',
  priorityNone: '#64748B',

  border: '#2A2A38',
  borderLight: 'rgba(255,255,255,0.06)',
  borderGlow: 'rgba(94,234,212,0.28)',
  borderCyan: 'rgba(103,232,249,0.28)',
  borderNav: 'rgba(94,234,212,0.35)',

  shadowDark: 'rgba(0,0,0,0.75)',
  shadowAccent: 'rgba(94,234,212,0.2)',
  shadowNav: 'rgba(94,234,212,0.4)',

  overlay: 'rgba(8,8,12,0.9)',
  tabBar: '#12121A',
  tabBarBorder: '#252532',
  tabBarVein: '#1E1E28',
  starfield: 'rgba(255,255,255,0.4)',

  clayHighlight: 'rgba(255,255,255,0.08)',
  clayShadow: 'rgba(0,0,0,0.5)',
};

const light = {
  bg: '#F4F6FA',
  bgElevated: '#FAFBFE',
  bgCard: '#FFFFFF',
  bgCardAlt: '#F8FAFF',
  bgCardDeep: '#EEF2F9',
  bgGlass: 'rgba(255,255,255,0.96)',
  bgGlassLight: 'rgba(255,255,255,0.85)',

  accent: '#14B8A6',
  accentDim: 'rgba(20,184,166,0.14)',
  accentSoft: 'rgba(20,184,166,0.08)',
  accentGlow: 'rgba(20,184,166,0.35)',
  accentMid: '#0D9488',

  navActive: '#14B8A6',
  navActiveMid: '#0D9488',
  navActiveDim: 'rgba(20,184,166,0.16)',
  navActiveGlow: 'rgba(20,184,166,0.35)',

  pastelMint: '#A7F3D0',
  pastelLavender: '#DDD6FE',
  pastelPeach: '#FDBA74',
  pastelSky: '#93C5FD',
  pastelRose: '#FECDD3',

  cyan: '#22D3EE',
  cyanDim: 'rgba(34,211,238,0.14)',
  purple: '#8B5CF6',
  purpleDim: 'rgba(139,92,246,0.14)',

  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textAccent: '#0D9488',

  danger: '#F43F5E',
  dangerDim: 'rgba(244,63,94,0.12)',
  warning: '#F59E0B',
  warningDim: 'rgba(245,158,11,0.12)',
  info: '#0EA5E9',
  infoDim: 'rgba(14,165,233,0.12)',
  success: '#14B8A6',
  successDim: 'rgba(20,184,166,0.12)',

  priorityHigh: '#F43F5E',
  priorityMedium: '#F59E0B',
  priorityLow: '#0EA5E9',
  priorityNone: '#94A3B8',

  border: '#D4DCEC',
  borderLight: 'rgba(255,255,255,0.9)',
  borderGlow: 'rgba(20,184,166,0.35)',
  borderCyan: 'rgba(34,211,238,0.3)',
  borderNav: 'rgba(20,184,166,0.3)',

  shadowDark: 'rgba(100,116,139,0.18)',
  shadowAccent: 'rgba(20,184,166,0.15)',
  shadowNav: 'rgba(20,184,166,0.25)',

  overlay: 'rgba(232,236,248,0.92)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#D8E0F0',
  tabBarVein: '#E8EDF8',
  starfield: 'rgba(20,184,166,0.12)',

  clayHighlight: 'rgba(255,255,255,0.95)',
  clayShadow: 'rgba(148,163,184,0.35)',
};

export const Colors = dark;

export function getColors(mode: ThemeMode) {
  return mode === 'light' ? light : dark;
}

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const Radius = {
  sm: 12, md: 18, lg: 26, xl: 34, full: 9999,
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
  caption: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
};

export const Shadows = {
  clay: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 12,
  },
  clayInset: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  clayGlow: {
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 14,
  },
  glow: {
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 14,
  },
  soft: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  navActive: {
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 18,
  },
};
