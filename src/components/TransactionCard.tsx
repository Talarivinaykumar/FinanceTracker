import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction, Category } from '../store/financeSlice';

interface Props {
  transaction: Transaction;
  category?: Category;
}

export const TransactionCard: React.FC<Props> = ({ transaction, category }) => {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#2E7D32' : '#D32F2F';

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{category?.icon || '?'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.categoryName}>{category?.name || 'Unknown'}</Text>
        {transaction.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{transaction.notes}</Text>
        ) : null}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F7',
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
    fontWeight: '600',
    color: '#1C1C1E',
  },
  notes: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
