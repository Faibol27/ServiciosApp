import { Platform } from 'react-native';

export const colors = {
  paper: '#F3F4EF',
  surface: '#FFFFFF',
  ink: '#17241D',
  muted: '#5F6A63',
  border: '#DDE2D8',
  track: '#E8EBE4',
  brand: '#23543F',
  brandSoft: '#E4EDE6',
  pending: '#8A5A12',
  pendingSoft: '#F7EBD5',
  completed: '#23543F',
  completedSoft: '#E4EDE6',
  cancelled: '#983E35',
  cancelledSoft: '#F7E6E3',
  cancelledBorder: '#EFCFC9',
  white: '#FFFFFF',
  overlay: 'rgba(18, 30, 23, 0.45)',
};

export const fonts = {
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: 'Georgia, "Times New Roman", serif',
    default: 'Georgia',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    default: 'System',
  }),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  card: 18,
  lg: 20,
  sheet: 28,
  pill: 999,
};

export const maxWidth = 460;
