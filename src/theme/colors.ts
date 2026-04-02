import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryBackground: string;
  border: string;
  gold: string;
  goldBackground: string;
  success: string;
  successBackground: string;
  danger: string;
  dangerBackground: string;
  warning: string;
  warningBackground: string;
  skeletonHighlight: string;
  skeletonBackground: string;
  statusBar: 'light-content' | 'dark-content';
}

const lightColors: ThemeColors = {
  background: '#faf9fa',
  card: '#ffffff',
  text: '#1b1c1d',
  textSecondary: '#434653',
  textTertiary: '#737784',
  primary: '#094cb2',
  primaryBackground: 'rgba(9, 76, 178, 0.08)',
  border: '#e3e2e3',
  gold: '#6d5e00',
  goldBackground: '#fffdf5',
  success: '#10B981',
  successBackground: 'rgba(16,185,129,0.12)',
  danger: '#F43F5E',
  dangerBackground: 'rgba(244,63,94,0.12)',
  warning: '#F59E0B',
  warningBackground: '#f9e37a', // Adapted from Goal card badge
  skeletonHighlight: 'rgba(0,0,0,0.1)',
  skeletonBackground: 'rgba(0,0,0,0.05)',
  statusBar: 'dark-content',
};

const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#a0aab5',
  textTertiary: '#737784',
  primary: '#4D8DF5',
  primaryBackground: 'rgba(77, 141, 245, 0.15)',
  border: '#333333',
  gold: '#b09a00',
  goldBackground: '#2c2700',
  success: '#34D399',
  successBackground: 'rgba(52,211,153,0.15)',
  danger: '#FB7185',
  dangerBackground: 'rgba(251,113,133,0.15)',
  warning: '#FBBF24',
  warningBackground: 'rgba(251,191,36,0.15)',
  skeletonHighlight: 'rgba(255,255,255,0.1)',
  skeletonBackground: 'rgba(255,255,255,0.05)',
  statusBar: 'light-content',
};

export const useTheme = (): ThemeColors => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
};
