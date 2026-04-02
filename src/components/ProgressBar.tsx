import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface Props {
  current: number;
  target: number;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<Props> = ({ current, target, color = '#2E7D32', height = 8 }) => {
  const percentage = Math.min(Math.max((current / target) * 100, 0), 100);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={styles.text}>${current.toFixed(2)}</Text>
        <Text style={styles.text}>${target.toFixed(2)}</Text>
      </View>
      <View style={[styles.track, { height }]}>
        <View style={[styles.progress, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  track: {
    width: '100%',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
});
