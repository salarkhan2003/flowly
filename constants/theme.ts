export type ThemeMode = 'dark' | 'light';

const dark = {
  // ── Backgrounds ──────────────────────────────────────────────
  bg: '#0A0F1C',
  bgCard: '#121A2B',
  bgCardAlt: '#16203A',
  bgCardDeep: '#0D1424',
  bgGlass: 'rgba(18, 26, 43, 0.82)',
  bgGlassLight: 'rgba(255,255,255,0.04)',

  // ── Accents ──────────────────────────────────────────────────
  accent: '#00FF9D',
  accentDim: 'rgba(0,255,157,0.12)',
  accentSoft: 'rgba(0,255,157,0.07)',
  accentGlow: 'rgba(0,255,157,0.45)',
  accentMid: '#00CC7A',
  cyan: '#00D4FF',
  cyanDim: 'rgba(0,212,255,0.12)',
  purple: '#B44DFF',
  purpleDim: 'rgba(180,77,255,0.12)',

  // ── Text ─────────────────────────────────────────────────────
  textPrimary: '#F0F4FF',
  textSecondary: '#A0A8C0',
  textMuted: '#3E4A66',
  textAccent: '#00FF9D',

  // ── Status ───────────────────────────────────────────────────
  danger: '#FF4D6D',
  dangerDim: 'rgba(255,77,109,0.12)',
  warning: '#FFB830',
  warningDim: 'rgba(255,184,48,0.12)',
  info: '#4D9FFF',
  infoDim: 'rgba(77,159,255,0.12)',
  success: '#00FF9D',
  successDim: 'rgba(0,255,157,0.12)',

  // ── Priority ─────────────────────────────────────────────────
  priorityHigh: '#FF4D6D',
  priorityMedium: '#FFB830',
  priorityLow: '#4D9FFF',
  priorityNone: '#3E4A66',

  // ── Borders ──────────────────────────────────────────────────
  border: '#1F2A45',
  borderLight: 'rgba(255,255,255,0.06)',
  borderGlow: 'rgba(0,255,157,0.3)',
  borderCyan: 'rgba(0,212,255,0.3)',

  // ── Shadows ──────────────────────────────────────────────────
  shadowDark: 'rgba(0,0,0,0.7)',
  shadowAccent: 'rgba(0,255,157,0.15)',

  // ── Nav ──────────────────────────────────────────────────────
  overlay: 'rgba(10,15,28,0.92)',
  tabBar: 'rgba(12,18,32,0.97)',
  tabBarBorder: '#1F2A45',
};

const light = {
  bg: '#F0F4FF',
  bgCard: '#FFFFFF',
  bgCardAlt: '#F5F7FF',
  bgCardDeep: '#E8EDF8',
  bgGlass: 'rgba(255,255,255,0.85)',
  bgGlassLight: 'rgba(0,0,0,0.03)',
  accent: '#00B86B',
  accentDim: 'rgba(0,184,107,0.10)',
  accentSoft: 'rgba(0,184,107,0.05)',
  accentGlow: 'rgba(0,184,107,0.35)',
  accentMid: '#009958',
  cyan: '#0099CC',
  cyanDim: 'rgba(0,153,204,0.10)',
  purple: '#8833CC',
  purpleDim: 'rgba(136,51,204,0.10)',
  textPrimary: '#0A1628',
  textSecondary: '#4A5568',
  textMuted: '#9AA5B4',
  textAccent: '#00B86B',
  danger: '#E53E5A',
  dangerDim: 'rgba(229,62,90,0.10)',
  warning: '#D97706',
  warningDim: 'rgba(217,119,6,0.10)',
  info: '#2563EB',
  infoDim: 'rgba(37,99,235,0.10)',
  success: '#00B86B',
  successDim: 'rgba(0,184,107,0.10)',
  priorityHigh: '#E53E5A',
  priorityMedium: '#D97706',
  priorityLow: '#2563EB',
  priorityNone: '#9AA5B4',
  border: '#E2E8F0',
  borderLight: 'rgba(0,0,0,0.05)',
  borderGlow: 'rgba(0,184,107,0.35)',
  borderCyan: 'rgba(0,153,204,0.3)',
  shadowDark: 'rgba(0,0,0,0.10)',
  shadowAccent: 'rgba(0,184,107,0.08)',
  overlay: 'rgba(240,244,255,0.95)',
  tabBar: 'rgba(255,255,255,0.97)',
  tabBarBorder: '#E2E8F0',
};

export const Colors = dark;

export function getColors(mode: ThemeMode) {
  return mode === 'light' ? light : dark;
}

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const Radius = {
  sm: 10, md: 16, lg: 24, xl: 32, full: 9999,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },
  clayGlow: {
    shadowColor: '#00FF9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: '#00FF9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
