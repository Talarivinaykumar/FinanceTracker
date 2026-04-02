import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Transaction, Category } from '../store/financeSlice';
import { useTheme, ThemeColors } from '../theme/colors';

interface Props {
  transaction: Transaction;
  category?: Category;
  index?: number;
}

export const TransactionCard: React.FC<Props> = ({ transaction, category, index = 0 }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? theme.success : theme.text;
  const iconBgColor = isIncome ? theme.successBackground : theme.skeletonBackground;

  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        <Text style={styles.icon}>{category?.icon || '💳'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.categoryName}>{category?.name || 'Unknown'}</Text>
        {transaction.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{transaction.notes}</Text>
        ) : (
          <Text style={styles.notes}>{new Date(transaction.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        )}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        {transaction.notes ? (
          <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: theme.card, padding: 16, marginBottom: 8,
    borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: theme.border,
  },
  iconWrapper: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  icon: { fontSize: 20 },
  detailsContainer: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 2, fontFamily: 'serif' },
  notes: { fontSize: 13, color: theme.textSecondary, fontWeight: '400' },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: '600', fontFamily: 'serif' },
  date: { fontSize: 12, color: theme.textTertiary, fontWeight: '400', marginTop: 2 },
});
