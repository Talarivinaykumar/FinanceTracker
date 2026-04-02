import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { TransactionCard } from '../components/TransactionCard';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react-native';

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { transactions, categories } = useAppSelector(state => state.finance);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = transactions.slice(0, 3);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello there,</Text>
        <Text style={styles.subtitle}>Here's your financial summary.</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
              <ArrowUpRight color="#2E7D32" size={20} />
            </View>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statAmount}>${totalIncome.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(211, 47, 47, 0.1)' }]}>
              <ArrowDownRight color="#D32F2F" size={20} />
            </View>
            <View>
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={styles.statAmount}>${totalExpense.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Wallet color="#C7C7CC" size={48} />
          <Text style={styles.emptyText}>No transactions yet.</Text>
        </View>
      ) : (
        recentTransactions.map(t => (
          <TransactionCard
            key={t.id}
            transaction={t}
            category={categories.find(c => c.id === t.categoryId)}
          />
        ))
      )}
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: {
    color: '#A1A1A6',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    color: '#A1A1A6',
    fontSize: 12,
  },
  statAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF', // Standard iOS blue
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#8E8E93',
    marginTop: 12,
    fontSize: 16,
  },
});
