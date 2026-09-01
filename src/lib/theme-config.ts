export type ThemeMode = 'light' | 'dark' | 'system';

export const themeConfig = {
  brandName: 'ELMS',
  primaryColor: '#4f46e5',
  accentColor: '#8b5cf6',
  defaultMode: 'light' as ThemeMode,
  radiusPreset: 'lg',
};

export function getThemeConfig() {
  return themeConfig;
}
