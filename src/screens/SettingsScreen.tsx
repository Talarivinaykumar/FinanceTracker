import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setBiometricsEnabled } from '../store/financeSlice';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Fingerprint, Shield, Info } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../theme/colors';

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const isBiometricsEnabled = useAppSelector(state => state.finance.isBiometricsEnabled);

  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const rnBiometrics = new ReactNativeBiometrics();
    rnBiometrics.isSensorAvailable()
      .then((resultObject) => {
        const { available } = resultObject;
        setSensorAvailable(available);
      })
      .catch(() => {
        setSensorAvailable(false);
      });
  }, []);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      if (!sensorAvailable) {
        Alert.alert('Not Supported', 'Biometric authentication is not available or not configured on this device.');
        return;
      }
      
      const rnBiometrics = new ReactNativeBiometrics();
      try {
        const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint to enable' });
        if (success) {
          dispatch(setBiometricsEnabled(true));
        } else {
          Alert.alert('Canceled', 'Biometric setup canceled.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to enable biometrics.');
      }
    } else {
      dispatch(setBiometricsEnabled(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBg}>
        <Text style={styles.headerSub}>Preferences</Text>
        <Text style={styles.headerTitle}>Settings ⚙️</Text>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.iconWrapper}>
                <Fingerprint color={theme.primary} size={24} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Biometric Lock</Text>
                <Text style={styles.settingDesc}>Use Fingerprint or FaceID to verify identity when opening the app.</Text>
              </View>
              <Switch
                trackColor={{ false: theme.border, true: theme.success }}
                thumbColor="#FFFFFF"
                onValueChange={toggleBiometrics}
                value={isBiometricsEnabled}
              />
            </View>
          </View>

          {sensorAvailable === false && (
            <View style={styles.warningBox}>
              <Info color={theme.textTertiary} size={16} />
              <Text style={styles.warningText}>No biometric hardware detected on this device.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.iconWrapper}>
                <Shield color={theme.success} size={24} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Data Privacy</Text>
                <Text style={styles.settingDesc}>All your financial data is stored securely on your device.</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  headerBg: {
    backgroundColor: theme.background,
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
  },
  headerSub: { color: theme.textTertiary, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { color: theme.text, fontSize: 26, fontWeight: '800', fontFamily: 'serif' },

  settingsContainer: { paddingHorizontal: 20, paddingTop: 10 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.textSecondary, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  
  settingCard: {
    backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border,
    padding: 20,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: theme.skeletonBackground,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  settingTextContainer: { flex: 1, marginRight: 16 },
  settingTitle: { fontSize: 17, fontWeight: '600', color: theme.text, marginBottom: 4 },
  settingDesc: { fontSize: 13, color: theme.textTertiary, lineHeight: 18 },

  warningBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.skeletonBackground,
    padding: 12, borderRadius: 8, marginTop: 12,
  },
  warningText: { color: theme.textTertiary, fontSize: 13, marginLeft: 8 },
});
