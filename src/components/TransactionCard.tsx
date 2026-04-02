import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction, Category } from '../store/financeSlice';

interface Props {
  transaction: Transaction;
  category?: Category;
}

export const TransactionCard: React.FC<Props> = ({ transaction, category }) => {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#094cb2' : '#1b1c1d';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: isIncome ? 'rgba(9, 76, 178, 0.08)' : '#f5f3f4' }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e2e3',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  detailsContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b1c1d',
    marginBottom: 2,
    fontFamily: 'serif',
  },
  notes: {
    fontSize: 13,
    color: '#434653',
    fontWeight: '400',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  date: {
    fontSize: 12,
    color: '#737784',
    fontWeight: '400',
    marginTop: 2,
  },
});
