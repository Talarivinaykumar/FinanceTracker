import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { TrendingUp, TrendingDown, Award, CalendarDays } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../theme/colors';

const screenWidth = Dimensions.get('window').width;

const getChartColor = (index: number) => {
  const colors = ['#6366F1', '#F43F5E', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6'];
  return colors[index % colors.length];
};

export const InsightsScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { transactions, categories } = useAppSelector(state => state.finance);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

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
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    };
  }).sort((a, b) => b.amount - a.amount);

  const highestExpense = chartData.length > 0 ? chartData[0] : null;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekExpenses = expenseTransactions
    .filter(t => new Date(t.date) >= oneWeekAgo && new Date(t.date) <= now)
    .reduce((sum, t) => sum + t.amount, 0);

  const lastWeekExpenses = expenseTransactions
    .filter(t => new Date(t.date) >= twoWeeksAgo && new Date(t.date) < oneWeekAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const weeklyDiff = thisWeekExpenses - lastWeekExpenses;
  const weeklyPercentage = lastWeekExpenses === 0
    ? (thisWeekExpenses > 0 ? 100 : 0)
    : (weeklyDiff / lastWeekExpenses) * 100;
  const isWeeklyGood = weeklyDiff <= 0;

  const monthlyData = [];
  const monthLabels = [];
  for (let i = 5; i >= 0; i--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(targetMonth.toLocaleString('default', { month: 'short' }));
    const mm = targetMonth.getMonth(), yy = targetMonth.getFullYear();
    monthlyData.push(
      expenseTransactions
        .filter(t => { const d = new Date(t.date); return d.getMonth() === mm && d.getFullYear() === yy; })
        .reduce((sum, t) => sum + t.amount, 0)
    );
  }
  const hasMonthlyData = monthlyData.some(v => v > 0);
  const safeMonthlyData = hasMonthlyData ? monthlyData : [0, 0, 0, 0, 0, 1];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBg}>
          <SkeletonLoader width={80} height={14} borderRadius={4} style={{ marginBottom: 8, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width={180} height={26} borderRadius={6} style={{ backgroundColor: theme.skeletonBackground }} />
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <SkeletonLoader width="100%" height={100} borderRadius={22} style={{ marginBottom: 24, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width="100%" height={200} borderRadius={22} style={{ marginBottom: 24, backgroundColor: theme.skeletonBackground }} />
          <SkeletonLoader width="100%" height={180} borderRadius={22} style={{ backgroundColor: theme.skeletonHighlight }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />}
    >
      <View style={styles.headerBg}>
        <Text style={styles.headerSub}>Analytics</Text>
        <Text style={styles.headerTitle}>Your Insights ✨</Text>
      </View>

      {chartData.length === 0 ? (
        <View style={[styles.emptyCard, { marginTop: 10 }]}>
          <Text style={styles.emptyEmoji}>📉</Text>
          <Text style={styles.emptyTitle}>No Insights Yet</Text>
          <Text style={styles.emptySub}>Add some expense transactions to see your analytics.</Text>
        </View>
      ) : (
        <View style={{ marginTop: 10, paddingHorizontal: 20 }}>

          {highestExpense && (
            <View style={styles.topCatCard}>
              <View style={styles.topCatRow}>
                <View>
                  <Text style={styles.topCatEyebrow}>🏆 HIGHEST SPENDING</Text>
                  <Text style={styles.topCatName}>{highestExpense.name}</Text>
                  <Text style={styles.topCatAmount}>
                    ${highestExpense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.awardCircle}>
                  <Award color={theme.warning} size={28} />
                </View>
              </View>
            </View>
          )}

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionText}>📅 Weekly Comparison</Text>
          </View>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyRow}>
              <View style={styles.weekBox}>
                <Text style={styles.weekLabel}>This Week</Text>
                <Text style={styles.weekAmt}>${thisWeekExpenses.toLocaleString()}</Text>
              </View>
              <View style={styles.weekDivider} />
              <View style={[styles.weekBox, { alignItems: 'flex-end' }]}>
                <Text style={styles.weekLabel}>Last Week</Text>
                <Text style={styles.weekAmt}>${lastWeekExpenses.toLocaleString()}</Text>
              </View>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: isWeeklyGood ? theme.successBackground : theme.dangerBackground }]}>
              {isWeeklyGood ? <TrendingDown color={theme.success} size={16} /> : <TrendingUp color={theme.danger} size={16} />}
              <Text style={[styles.diffText, { color: isWeeklyGood ? theme.success : theme.danger }]}>
                {isWeeklyGood ? '↓ Down' : '↑ Up'} {Math.abs(weeklyPercentage).toFixed(1)}% vs last week
              </Text>
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionText}>🍩 Category Breakdown</Text>
          </View>
          <View style={styles.chartCard}>
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={200}
              chartConfig={{ color: (opacity = 1) => `rgba(0,0,0,${opacity})` }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              hasLegend={false}
              center={[30, 0]}
              absolute
            />
            <View style={styles.legendContainer}>
              {chartData.slice(0, 5).map((item, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.legendAmt}>${item.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionText}>📈 6-Month Trend</Text>
            <CalendarDays color={theme.textTertiary} size={18} />
          </View>
          <View style={[styles.chartCard, { paddingRight: 32, paddingTop: 20 }]}>
            <LineChart
              data={{ labels: monthLabels, datasets: [{ data: safeMonthlyData }] }}
              width={screenWidth - 40}
              height={200}
              withInnerLines={false}
              withOuterLines={false}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: (opacity = 1) => theme.textSecondary,
                strokeWidth: 3,
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#4F46E5' },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </View>

        </View>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  headerBg: {
    backgroundColor: theme.background,
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
  },
  headerSub: { color: theme.textTertiary, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { color: theme.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, fontFamily: 'serif' },

  emptyCard: {
    marginHorizontal: 20, backgroundColor: theme.card, borderRadius: 8, padding: 40,
    alignItems: 'center', borderWidth: 1, borderColor: theme.border,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 6, fontFamily: 'serif' },
  emptySub: { fontSize: 13, color: theme.textTertiary, textAlign: 'center' },

  topCatCard: {
    backgroundColor: theme.primary, borderRadius: 8, padding: 24, marginBottom: 20, elevation: 0,
  },
  topCatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topCatEyebrow: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  topCatName: { color: '#ffffff', fontSize: 26, fontWeight: '800', marginBottom: 4, fontFamily: 'serif' },
  topCatAmount: { color: '#e7ebff', fontSize: 18, fontWeight: '700' },
  awardCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },

  sectionTitle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8,
  },
  sectionText: { fontSize: 16, fontWeight: '800', color: theme.text, fontFamily: 'serif' },

  weeklyCard: {
    backgroundColor: theme.card, borderRadius: 8, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: theme.border,
  },
  weeklyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  weekBox: { flex: 1 },
  weekDivider: { width: 1, height: 40, backgroundColor: theme.border, marginHorizontal: 20 },
  weekLabel: { color: theme.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  weekAmt: { color: theme.text, fontSize: 22, fontWeight: '800', fontFamily: 'serif' },
  diffBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 4,
  },
  diffText: { fontWeight: '700', fontSize: 13, marginLeft: 6 },

  chartCard: {
    backgroundColor: theme.card, borderRadius: 8, paddingVertical: 16, marginBottom: 20,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center', overflow: 'hidden',
  },
  legendContainer: { width: '100%', paddingHorizontal: 20, paddingBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendName: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.textSecondary },
  legendAmt: { fontSize: 13, fontWeight: '700', color: theme.text, fontFamily: 'serif' },
});
