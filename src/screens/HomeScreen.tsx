import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated as RNAnimated, RefreshControl, LayoutAnimation, UIManager, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { TransactionCard } from '../components/TransactionCard';
import { ProgressBar } from '../components/ProgressBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { PieChart } from 'react-native-chart-kit';
import { ArrowUpRight, ArrowDownRight, Wallet, ChevronRight, Bell } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../theme/colors';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const screenWidth = Dimensions.get('window').width;

const getChartColor = (index: number) => {
  const colors = ['#6366F1', '#F43F5E', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6'];
  return colors[index % colors.length];
};

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const { transactions, categories, goals, notifications } = useAppSelector(state => state.finance);
  const [isLoading, setIsLoading] = React.useState(true);
  const fadeAnim = React.useRef(new RNAnimated.Value(0)).current;
  const slideAnim = React.useRef(new RNAnimated.Value(30)).current;
  const bellAnim = React.useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [transactions, goals]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        RNAnimated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
      
      RNAnimated.sequence([
        RNAnimated.delay(800),
        RNAnimated.spring(bellAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
      ]).start();
    }, 800);
    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, bellAnim]);

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
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    };
  }).sort((a, b) => b.amount - a.amount);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBg}>
          <SkeletonLoader width={100} height={14} borderRadius={4} style={{ marginBottom: 6, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width={180} height={26} borderRadius={6} style={{ backgroundColor: theme.skeletonBackground }} />
        </View>
        <View style={styles.balanceCard}>
          <SkeletonLoader width={130} height={13} borderRadius={4} style={{ marginBottom: 10, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width={210} height={42} borderRadius={8} style={{ marginBottom: 28, backgroundColor: theme.skeletonBackground }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SkeletonLoader width={(screenWidth - 100) / 2} height={64} borderRadius={16} style={{ backgroundColor: theme.skeletonHighlight }} />
            <SkeletonLoader width={(screenWidth - 100) / 2} height={64} borderRadius={16} style={{ backgroundColor: theme.skeletonHighlight }} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <SkeletonLoader width={140} height={18} borderRadius={6} style={{ marginBottom: 14, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width="100%" height={90} borderRadius={20} style={{ marginBottom: 28, backgroundColor: theme.skeletonBackground }} />
          <SkeletonLoader width={160} height={18} borderRadius={6} style={{ marginBottom: 14, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width="100%" height={160} borderRadius={20} style={{ backgroundColor: theme.skeletonBackground }}/>
        </View>
      </View>
    );
  }

  const bellRotation = bellAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-15deg', '15deg', '0deg']
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Hi there 👋</Text>
            <Text style={styles.headerTitle}>Wealth Overview</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
            <RNAnimated.View style={{ transform: [{ rotate: bellRotation }, { scale: bellAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
              <Bell color={theme.text} size={24} />
              {notifications && notifications.length > 0 && <View style={styles.bellBadge} />}
            </RNAnimated.View>
          </TouchableOpacity>
        </View>
      </View>

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
              <ArrowUpRight color={theme.success} size={16} />
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
              <ArrowDownRight color={theme.danger} size={16} />
            </View>
            <View>
              <Text style={styles.statChipLabel}>Expenses</Text>
              <AnimatedNumber
                value={totalExpense}
                formatter={val => `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                style={{ color: theme.danger, fontSize: 15, fontWeight: '800', marginTop: 1 }}
                duration={900}
                trigger={refreshCount}
              />
            </View>
          </View>
        </View>
      </RNAnimated.View>

      {topGoal && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Savings Target</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')} style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>Details</Text>
              <ChevronRight color={theme.primary} size={15} />
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
            <ProgressBar current={topGoal.current} target={topGoal.target} color={theme.primary} height={10} />
          </TouchableOpacity>
        </View>
      )}

      {chartData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Spending Analytics</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Insights')} style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>Report</Text>
              <ChevronRight color={theme.primary} size={15} />
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')} style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>View All</Text>
            <ChevronRight color={theme.primary} size={15} />
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Wallet color={theme.textTertiary} size={36} />
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

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  headerBg: {
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { color: theme.textTertiary, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { color: theme.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, fontFamily: 'serif' },
  bellBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  bellBadge: { position: 'absolute', top: 0, right: 3, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.danger, borderWidth: 2, borderColor: theme.card },
  
  balanceCard: {
    backgroundColor: theme.card, marginHorizontal: 20, marginTop: 0,
    borderRadius: 12, padding: 24, borderWidth: 1, borderColor: theme.border,
  },
  balanceLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  balanceAmount: {
    color: theme.text, fontSize: 38, fontWeight: '900',
    marginTop: 4, marginBottom: 20, letterSpacing: -1, fontFamily: 'serif',
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background,
    borderRadius: 8, padding: 14, borderWidth: 1, borderColor: theme.border,
  },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statChipDivider: { width: 1, height: 36, backgroundColor: theme.border },
  statChipIconGreen: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: theme.successBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  statChipIconRed: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: theme.dangerBackground,
    justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },
  statChipLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '600' },
  statChipValue: { color: theme.text, fontSize: 15, fontWeight: '800', marginTop: 1, fontFamily: 'serif' },

  section: { marginTop: 28, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: theme.text, fontFamily: 'serif' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAll: { fontSize: 13, fontWeight: '600', color: theme.primary, marginRight: 2 },

  goalCard: {
    backgroundColor: theme.card, borderRadius: 8, padding: 20,
    borderLeftWidth: 4, borderLeftColor: theme.gold,
    borderWidth: 1, borderColor: theme.border,
  },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  goalName: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 4, fontFamily: 'serif' },
  goalSub: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
  goalBadge: { backgroundColor: theme.warningBackground, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  goalBadgeText: { fontSize: 13, fontWeight: '800', color: theme.gold },

  chartCard: {
    backgroundColor: theme.card, borderRadius: 8, paddingTop: 16,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  chartLegend: { width: '100%', paddingHorizontal: 20, paddingBottom: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendName: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.textSecondary },
  legendAmt: { fontSize: 13, fontWeight: '700', color: theme.text, fontFamily: 'serif' },

  txList: {},
  emptyState: {
    alignItems: 'center', paddingVertical: 40, backgroundColor: theme.card,
    borderRadius: 8, borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed',
  },
  emptyTitle: { color: theme.text, fontSize: 15, fontWeight: '700', marginTop: 12, fontFamily: 'serif' },
  emptySub: { color: theme.textTertiary, fontSize: 13, marginTop: 4 },
});
