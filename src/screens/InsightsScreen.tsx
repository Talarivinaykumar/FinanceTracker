import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const getChartColor = (index: number) => {
  const colors = ['#2E7D32', '#4CAF50', '#81C784', '#C8E6C9', '#1C1C1E', '#8E8E93'];
  return colors[index % colors.length];
};

export const InsightsScreen = () => {
  const insets = useSafeAreaInsets();
  const { transactions, categories } = useAppSelector(state => state.finance);

  // Focus primarily on Expenses for insights
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const categoryTotals: { [key: string]: number } = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });

  const chartData = Object.keys(categoryTotals).map((catId, index) => {
    const cat = categories.find(c => c.id === catId);
    return {
      name: cat?.name || 'Unknown',
      amount: categoryTotals[catId],
      color: getChartColor(index),
      legendFontColor: '#1C1C1E',
      legendFontSize: 12,
    };
  }).sort((a, b) => b.amount - a.amount);

  const highestExpense = chartData[0];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      {chartData.length > 0 ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expense Breakdown</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Top Spending Category</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
               <Text style={styles.summaryCatName}>{highestExpense.name}</Text>
               <Text style={styles.summaryAmount}>${highestExpense.amount.toFixed(2)}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Not enough data for insights.</Text>
        </View>
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
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
  },
  summaryTitle: {
    color: '#A1A1A6',
    fontSize: 14,
    marginBottom: 8,
  },
  summaryCatName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  summaryAmount: {
    color: '#D32F2F',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
