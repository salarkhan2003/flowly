import { useThemeStore } from '../stores/themeStore';
import { getColors } from '../constants/theme';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  return { C: getColors(mode), mode };
}
