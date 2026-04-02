import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction, Category } from '../store/financeSlice';

interface Props {
  transaction: Transaction;
  category?: Category;
}

export const TransactionCard: React.FC<Props> = ({ transaction, category }) => {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#10B981' : '#0F172A';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.1)' : '#F1F5F9' }]}>
        <Text style={styles.icon}>{category?.icon || '💳'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.categoryName}>{category?.name || 'Unknown'}</Text>
        {transaction.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{transaction.notes}</Text>
        ) : (
          <Text style={styles.notes}>{new Date(transaction.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text>
        )}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        {transaction.notes ? (
          <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  detailsContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  notes: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },
});
