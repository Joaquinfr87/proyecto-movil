export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#93C5FD',

  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#6EE7B7',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  error: '#EF4444',
  errorLight: '#FCA5A5',

  success: '#22C55E',
  warning: '#F59E0B',

  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
