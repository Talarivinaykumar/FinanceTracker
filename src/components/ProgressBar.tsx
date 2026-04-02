import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme, ThemeColors } from '../theme/colors';

interface Props {
  current: number;
  target: number;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<Props> = ({ current, target, color, height = 8 }) => {
  const percentage = Math.min(Math.max((current / target) * 100, 0), 100);
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const activeColor = color || theme.gold;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={styles.text}>${current.toFixed(2)}</Text>
        <Text style={styles.text}>${target.toFixed(2)}</Text>
      </View>
      <View style={[styles.track, { height }]}>
        <View style={[styles.progress, { width: `${percentage}%`, backgroundColor: activeColor }]} />
      </View>
    </View>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { width: '100%', marginVertical: 8 },
  track: { width: '100%', backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 4 },
  text: { fontSize: 12, fontWeight: '500', color: theme.textSecondary },
});
