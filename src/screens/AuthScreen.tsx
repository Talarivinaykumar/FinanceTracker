import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Fingerprint, Lock } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../theme/colors';

interface Props {
  onUnlock: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onUnlock }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [errorMsg, setErrorMsg] = useState('');

  const attemptUnlock = async () => {
    setErrorMsg('');
    const rnBiometrics = new ReactNativeBiometrics();
    try {
      const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Verify identity to unlock FinanceTracker' });
      if (success) {
        onUnlock();
      } else {
        setErrorMsg('Authentication failed or canceled.');
      }
    } catch (e) {
      setErrorMsg('Too many attempts or biometrics disabled.');
    }
  };

  useEffect(() => {
    attemptUnlock();

    // Re-prompt if app comes from background
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        attemptUnlock();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Lock color={theme.primary} size={48} />
      </View>
      <Text style={styles.title}>App Locked</Text>
      <Text style={styles.subtitle}>Unlock to view your financial data</Text>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <TouchableOpacity style={styles.unlockBtn} onPress={attemptUnlock} activeOpacity={0.8}>
        <Fingerprint color="#FFFFFF" size={24} style={{ marginRight: 12 }} />
        <Text style={styles.unlockBtnText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.background,
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  iconContainer: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: theme.primaryBackground,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.text, fontFamily: 'serif', marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.textSecondary, marginBottom: 40, textAlign: 'center' },
  errorText: { color: theme.danger, fontSize: 14, marginBottom: 24, fontWeight: '500' },
  
  unlockBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary,
    paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30,
  },
  unlockBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
