import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addGoal, updateGoal, setMonthlyBudget } from '../store/financeSlice';
import { ProgressBar } from '../components/ProgressBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Target, Plus, X, Edit3, AlertCircle } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../theme/colors';

const getGoalColor = (index: number, theme: ThemeColors) => {
  const colors = [theme.primary, theme.success, theme.warning, theme.danger, '#8B5CF6', '#0EA5E9'];
  return colors[index % colors.length];
};

export const GoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const { goals, transactions, monthlyBudget } = useAppSelector(state => state.finance);
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

  // Calculate current month's expenses
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetPercentage = Math.min((currentMonthExpenses / (monthlyBudget || 1)) * 100, 100);
  let budgetColor = theme.success; // Green
  if (budgetPercentage >= 90) budgetColor = theme.danger; // Red
  else if (budgetPercentage >= 75) budgetColor = theme.warning; // Orange

  // Modals state
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [addFundsVisible, setAddFundsVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState('');
  const [newBudget, setNewBudget] = useState(monthlyBudget?.toString() || '2000');

  const handleCreateGoal = () => {
    if (title && target && !isNaN(Number(target))) {
      dispatch(addGoal({
        title,
        target: Number(target),
        current: 0
      }));
      setGoalModalVisible(false);
      setTitle('');
      setTarget('');
    }
  };

  const handleUpdateBudget = () => {
    if (newBudget && !isNaN(Number(newBudget))) {
      dispatch(setMonthlyBudget(Number(newBudget)));
      setBudgetModalVisible(false);
    }
  };

  const openAddFunds = (goalId: string) => {
    setSelectedGoalId(goalId);
    setFundsAmount('');
    setAddFundsVisible(true);
  };

  const handleUpdateGoal = () => {
    if (selectedGoalId && fundsAmount && !isNaN(Number(fundsAmount))) {
      dispatch(updateGoal({
        id: selectedGoalId,
        amountToAdd: Number(fundsAmount)
      }));
      setAddFundsVisible(false);
      setSelectedGoalId(null);
      setFundsAmount('');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBg}>
          <SkeletonLoader width={140} height={14} borderRadius={4} style={{ marginBottom: 8, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width={180} height={26} borderRadius={6} style={{ backgroundColor: theme.skeletonBackground }} />
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <SkeletonLoader width="100%" height={160} borderRadius={22} style={{ marginBottom: 24, backgroundColor: theme.skeletonHighlight }} />
          <SkeletonLoader width="100%" height={120} borderRadius={22} style={{ marginBottom: 16, backgroundColor: theme.skeletonBackground }} />
          <SkeletonLoader width="100%" height={120} borderRadius={22} style={{ backgroundColor: theme.skeletonHighlight }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* header banner */}
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Challenges & Tracking</Text>
            <Text style={styles.headerTitle}>Goals & Budget 🎯</Text>
          </View>
          <TouchableOpacity onPress={() => setGoalModalVisible(true)} style={styles.addBtn}>
            <Plus color={theme.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />}
      >
        {/* Budget Card */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>💰 Monthly Budget</Text>
          <TouchableOpacity
            style={[styles.budgetCard, budgetPercentage >= 100 && styles.budgetCardDanger]}
            activeOpacity={0.85}
            onPress={() => setBudgetModalVisible(true)}
          >
            <View style={styles.budgetHeader}>
              <View>
                <Text style={styles.budgetLabel}>Month's Spending</Text>
                <Text style={styles.budgetSpent}>
                  ${currentMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <Text style={styles.budgetOf}> / ${monthlyBudget.toLocaleString()}</Text>
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBudgetModalVisible(true)} style={styles.editBtn}>
                <Edit3 color={theme.textSecondary} size={18} />
              </TouchableOpacity>
            </View>
            <ProgressBar current={currentMonthExpenses} target={monthlyBudget || 1} color={budgetColor} height={12} />
            {budgetPercentage >= 90 && (
              <View style={styles.alertBox}>
                <AlertCircle color={theme.danger} size={16} />
                <Text style={styles.alertText}>Approaching or exceeded budget limit!</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Goals */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>🏅 Savings Goals</Text>
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Target color={theme.textTertiary} size={36} />
              <Text style={styles.emptyTitle}>No goals yet</Text>
              <Text style={styles.emptySub}>Tap + to create your first savings goal</Text>
            </View>
          ) : (
            goals.map((goal, idx) => {
              const goalColor = getGoalColor(idx, theme);
              return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalCard, { borderLeftColor: goalColor }]}
                activeOpacity={0.8}
                onPress={() => openAddFunds(goal.id)}
              >
                <View style={styles.goalRow}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View style={[styles.goalBadge, { backgroundColor: theme.skeletonBackground }]}>
                    <Text style={[styles.goalPct, { color: goalColor }]}>
                      {Math.round((goal.current / goal.target) * 100)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.goalSub}>${goal.current.toLocaleString()} saved of ${goal.target.toLocaleString()}</Text>
                <ProgressBar current={goal.current} target={goal.target} color={goalColor} height={10} />
                <Text style={styles.tapHint}>Tap to add funds →</Text>
              </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* NEW GOAL MODAL */}
      <Modal visible={goalModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Savings Goal</Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)} style={styles.closeBtn}>
                <X color={theme.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Goal Title (e.g. Vacation)"
              placeholderTextColor={theme.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Target Amount ($)"
              placeholderTextColor={theme.textTertiary}
              keyboardType="numeric"
              value={target}
              onChangeText={setTarget}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateGoal}>
              <Text style={styles.saveBtnText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UPDATE BUDGET MODAL */}
      <Modal visible={budgetModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Monthly Budget</Text>
              <TouchableOpacity onPress={() => setBudgetModalVisible(false)} style={styles.closeBtn}>
                <X color={theme.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Budget Limit ($)"
              placeholderTextColor={theme.textTertiary}
              keyboardType="numeric"
              value={newBudget}
              onChangeText={setNewBudget}
              autoFocus
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateBudget}>
              <Text style={styles.saveBtnText}>Update Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD FUNDS MODAL */}
      <Modal visible={addFundsVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds to Goal</Text>
              <TouchableOpacity onPress={() => setAddFundsVisible(false)} style={styles.closeBtn}>
                <X color={theme.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount to Add ($)"
              placeholderTextColor={theme.textTertiary}
              keyboardType="numeric"
              value={fundsAmount}
              onChangeText={setFundsAmount}
              autoFocus
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateGoal}>
              <Text style={styles.saveBtnText}>Save Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  headerBg: {
    backgroundColor: theme.background,
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { color: theme.textTertiary, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { color: theme.text, fontSize: 26, fontWeight: '800', fontFamily: 'serif' },

  addBtn: {
    backgroundColor: theme.card, width: 44, height: 44, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  sectionWrapper: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: theme.text, marginBottom: 14, fontFamily: 'serif' },

  budgetCard: {
    backgroundColor: theme.card, padding: 24, borderRadius: 8,
    borderWidth: 1, borderColor: theme.border,
  },
  budgetCardDanger: { borderColor: theme.danger, borderWidth: 1.5 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  budgetLabel: { fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  budgetSpent: { fontSize: 28, fontWeight: '800', color: theme.text, fontFamily: 'serif' },
  budgetOf: { fontSize: 18, color: theme.textSecondary, fontWeight: '600', fontFamily: 'serif' },
  editBtn: { padding: 8, backgroundColor: theme.skeletonBackground, borderRadius: 4 },
  alertBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.dangerBackground,
    padding: 12, borderRadius: 8, marginTop: 16,
  },
  alertText: { color: theme.danger, fontSize: 13, fontWeight: '600', marginLeft: 8 },

  goalCard: {
    backgroundColor: theme.card, padding: 20, borderRadius: 8, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: theme.text, fontFamily: 'serif' },
  goalSub: { fontSize: 12, color: theme.textTertiary, fontWeight: '500', marginBottom: 12 },
  goalBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  goalPct: { fontSize: 13, fontWeight: '800' },
  tapHint: { color: theme.textSecondary, fontSize: 12, fontWeight: '500', marginTop: 10, textAlign: 'center' },

  emptyState: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: theme.card,
    borderRadius: 8, borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed',
  },
  emptyTitle: { color: theme.text, fontSize: 16, fontWeight: '700', marginTop: 12, fontFamily: 'serif' },
  emptySub: { color: theme.textTertiary, fontSize: 13, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '85%', backgroundColor: theme.card, borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: theme.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, fontFamily: 'serif' },
  closeBtn: { padding: 6, backgroundColor: theme.skeletonBackground, borderRadius: 8 },
  input: {
    backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    padding: 16, fontSize: 16, marginBottom: 16, fontWeight: '500', color: theme.text,
  },
  saveBtn: {
    backgroundColor: theme.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
