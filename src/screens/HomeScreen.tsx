import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated as RNAnimated, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { TransactionCard } from '../components/TransactionCard';
import { ProgressBar } from '../components/ProgressBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { PieChart } from 'react-native-chart-kit';
import { ArrowUpRight, ArrowDownRight, Wallet, ChevronRight, TrendingUp } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

const getChartColor = (index: number) => {
  const colors = ['#6366F1', '#F43F5E', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6'];
  return colors[index % colors.length];
};

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { transactions, categories, goals } = useAppSelector(state => state.finance);
  const [isLoading, setIsLoading] = React.useState(true);
  const fadeAnim = React.useRef(new RNAnimated.Value(0)).current;
  const slideAnim = React.useRef(new RNAnimated.Value(30)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        RNAnimated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }, 800);
    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCount, setRefreshCount] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshCount(prev => prev + 1);
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        RNAnimated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }, 800);
  }, [fadeAnim, slideAnim]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const recentTransactions = transactions.slice(0, 4);
  const topGoal = goals.length > 0 ? goals[0] : null;

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryTotals: { [key: string]: number } = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });
  const chartData = Object.keys(categoryTotals).map((catId, index) => {
    const cat = categories.find(c => c.id === catId);
    return {
      name: cat?.name || 'Other',
      amount: categoryTotals[catId],
      color: getChartColor(index),
      legendFontColor: '#64748B',
      legendFontSize: 12,
    };
  }).sort((a, b) => b.amount - a.amount);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBg}>
          <SkeletonLoader width={100} height={14} borderRadius={4} style={{ marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <SkeletonLoader width={180} height={26} borderRadius={6} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
        </View>
        <View style={styles.balanceCard}>
          <SkeletonLoader width={130} height={13} borderRadius={4} style={{ marginBottom: 10 }} />
          <SkeletonLoader width={210} height={42} borderRadius={8} style={{ marginBottom: 28 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SkeletonLoader width={(screenWidth - 100) / 2} height={64} borderRadius={16} />
            <SkeletonLoader width={(screenWidth - 100) / 2} height={64} borderRadius={16} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <SkeletonLoader width={140} height={18} borderRadius={6} style={{ marginBottom: 14 }} />
          <SkeletonLoader width="100%" height={90} borderRadius={20} style={{ marginBottom: 28 }} />
          <SkeletonLoader width={160} height={18} borderRadius={6} style={{ marginBottom: 14 }} />
          <SkeletonLoader width="100%" height={160} borderRadius={20} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" colors={['#6366F1']} />}
    >
      {/* Colored Header Banner */}
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Hi there 👋</Text>
            <Text style={styles.headerTitle}>Wealth Overview</Text>
          </View>
          {/* <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>VK</Text>
          </View> */}
        </View>
      </View>

      {/* Floating Balance Card */}
      <RNAnimated.View style={[styles.balanceCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.balanceLabel}>NET BALANCE</Text>
        <AnimatedNumber
          value={balance}
          formatter={val => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          style={styles.balanceAmount}
          duration={1200}
          trigger={refreshCount}
        />
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <View style={styles.statChipIconGreen}>
              <ArrowUpRight color="#10B981" size={16} />
            </View>
            <View>
              <Text style={styles.statChipLabel}>Income</Text>
              <AnimatedNumber
                value={totalIncome}
                formatter={val => `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                style={styles.statChipValue}
                duration={900}
                trigger={refreshCount}
              />
            </View>
          </View>

          <View style={styles.statChipDivider} />

          <View style={styles.statChip}>
            <View style={styles.statChipIconRed}>
              <ArrowDownRight color="#F43F5E" size={16} />
            </View>
            <View>
              <Text style={styles.statChipLabel}>Expenses</Text>
              <AnimatedNumber
                value={totalExpense}
                formatter={val => `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                style={{ color: '#F43F5E', fontSize: 15, fontWeight: '800', marginTop: 1 }}
                duration={900}
                trigger={refreshCount}
              />
            </View>
          </View>
        </View>
      </RNAnimated.View>

      {/* Savings Goal */}
      {topGoal && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Savings Target</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')} style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>Details</Text>
              <ChevronRight color="#6366F1" size={15} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.goalCard} onPress={() => navigation.navigate('Goals')} activeOpacity={0.85}>
            <View style={styles.goalTopRow}>
              <View>
                <Text style={styles.goalName}>{topGoal.title}</Text>
                <Text style={styles.goalSub}>${topGoal.current.toLocaleString()} saved of ${topGoal.target.toLocaleString()}</Text>
              </View>
              <View style={styles.goalBadge}>
                <Text style={styles.goalBadgeText}>{Math.round((topGoal.current / topGoal.target) * 100)}%</Text>
              </View>
            </View>
            <ProgressBar current={topGoal.current} target={topGoal.target} color="#6366F1" height={10} />
          </TouchableOpacity>
        </View>
      )}

      {/* Spending Analytics */}
      {chartData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Spending Analytics</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Insights')} style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>Report</Text>
              <ChevronRight color="#6366F1" size={15} />
            </TouchableOpacity>
          </View>
          <View style={styles.chartCard}>
            <PieChart
              data={chartData}
              width={screenWidth - 56}
              height={180}
              chartConfig={{ color: (opacity = 1) => `rgba(0,0,0,${opacity})` }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              hasLegend={false}
              center={[30, 0]}
              absolute
            />
            <View style={styles.chartLegend}>
              {chartData.slice(0, 4).map((item, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.legendAmt}>${item.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')} style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>View All</Text>
            <ChevronRight color="#6366F1" size={15} />
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Wallet color="#CBD5E1" size={36} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySub}>Add one to get started</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {recentTransactions.map(t => (
              <TransactionCard
                key={t.id}
                transaction={t}
                category={categories.find(c => c.id === t.categoryId)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf9fa' },

  // Clean top header banner
  headerBg: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { color: '#737784', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { color: '#1b1c1d', fontSize: 26, fontWeight: '800', letterSpacing: -0.5, fontFamily: 'serif' },
  avatarWrap: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#e3e2e3',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#c3c6d5',
  },
  avatarText: { color: '#1b1c1d', fontWeight: '800', fontSize: 15 },

  // Balance card tonal shift
  balanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e3e2e3',
  },
  balanceLabel: { color: '#434653', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  balanceAmount: {
    color: '#1b1c1d', fontSize: 38, fontWeight: '900',
    marginTop: 4, marginBottom: 20, letterSpacing: -1, fontFamily: 'serif',
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#faf9fa', borderRadius: 8, padding: 14,
    borderWidth: 1, borderColor: '#e3e2e3',
  },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statChipDivider: { width: 1, height: 36, backgroundColor: '#e3e2e3' },
  statChipIconGreen: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(9, 76, 178, 0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  statChipIconRed: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f5f3f4',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 12,
  },
  statChipLabel: { color: '#434653', fontSize: 11, fontWeight: '600' },
  statChipValue: { color: '#1b1c1d', fontSize: 15, fontWeight: '800', marginTop: 1, fontFamily: 'serif' },

  section: { marginTop: 28, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1b1c1d', fontFamily: 'serif' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#094cb2', marginRight: 2 },

  // Goal card 
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6d5e00',
    borderWidth: 1,
    borderColor: '#e3e2e3',
  },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  goalName: { fontSize: 16, fontWeight: '700', color: '#1b1c1d', marginBottom: 4, fontFamily: 'serif' },
  goalSub: { fontSize: 12, color: '#434653', fontWeight: '500' },
  goalBadge: {
    backgroundColor: '#f9e37a',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 4,
  },
  goalBadgeText: { fontSize: 13, fontWeight: '800', color: '#6d5e00' },

  // Chart card
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: '#e3e2e3',
    alignItems: 'center',
  },
  chartLegend: { width: '100%', paddingHorizontal: 20, paddingBottom: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#434653' },
  legendAmt: { fontSize: 13, fontWeight: '700', color: '#1b1c1d', fontFamily: 'serif' },

  txList: {},
  emptyState: {
    alignItems: 'center', paddingVertical: 40,
    backgroundColor: '#ffffff', borderRadius: 8,
    borderWidth: 1.5, borderColor: '#e3e2e3', borderStyle: 'dashed',
  },
  emptyTitle: { color: '#1b1c1d', fontSize: 15, fontWeight: '700', marginTop: 12, fontFamily: 'serif' },
  emptySub: { color: '#737784', fontSize: 13, marginTop: 4 },
});
