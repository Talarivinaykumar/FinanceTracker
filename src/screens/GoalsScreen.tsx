import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addGoal, updateGoal, setMonthlyBudget } from '../store/financeSlice';
import { ProgressBar } from '../components/ProgressBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Target, Plus, X, Edit3, AlertCircle } from 'lucide-react-native';

const GOAL_COLORS = ['#6366F1', '#0D9488', '#F59E0B', '#F43F5E', '#8B5CF6', '#0EA5E9'];

export const GoalsScreen = () => {
  const insets = useSafeAreaInsets();
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
  let budgetColor = '#10B981'; // Green
  if (budgetPercentage >= 90) budgetColor = '#EF4444'; // Red
  else if (budgetPercentage >= 75) budgetColor = '#F59E0B'; // Orange

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
          <SkeletonLoader width={140} height={14} borderRadius={4} style={{ marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <SkeletonLoader width={180} height={26} borderRadius={6} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <SkeletonLoader width="100%" height={160} borderRadius={22} style={{ marginBottom: 24 }} />
          <SkeletonLoader width="100%" height={120} borderRadius={22} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={120} borderRadius={22} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Teal header banner */}
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Challenges & Tracking</Text>
            <Text style={styles.headerTitle}>Goals & Budget 🎯</Text>
          </View>
          <TouchableOpacity onPress={() => setGoalModalVisible(true)} style={styles.addBtn}>
            <Plus color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" colors={['#0D9488']} />}
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
                <Edit3 color="#64748B" size={18} />
              </TouchableOpacity>
            </View>
            <ProgressBar current={currentMonthExpenses} target={monthlyBudget || 1} color={budgetColor} height={12} />
            {budgetPercentage >= 90 && (
              <View style={styles.alertBox}>
                <AlertCircle color="#EF4444" size={16} />
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
              <Target color="#CBD5E1" size={36} />
              <Text style={styles.emptyTitle}>No goals yet</Text>
              <Text style={styles.emptySub}>Tap + to create your first savings goal</Text>
            </View>
          ) : (
            goals.map((goal, idx) => (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalCard, { borderLeftColor: GOAL_COLORS[idx % GOAL_COLORS.length] }]}
                activeOpacity={0.8}
                onPress={() => openAddFunds(goal.id)}
              >
                <View style={styles.goalRow}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View style={[styles.goalBadge, { backgroundColor: GOAL_COLORS[idx % GOAL_COLORS.length] + '20' }]}>
                    <Text style={[styles.goalPct, { color: GOAL_COLORS[idx % GOAL_COLORS.length] }]}>
                      {Math.round((goal.current / goal.target) * 100)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.goalSub}>${goal.current.toLocaleString()} saved of ${goal.target.toLocaleString()}</Text>
                <ProgressBar current={goal.current} target={goal.target} color={GOAL_COLORS[idx % GOAL_COLORS.length]} height={10} />
                <Text style={styles.tapHint}>Tap to add funds →</Text>
              </TouchableOpacity>
            ))
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
                <X color="#475569" size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Goal Title (e.g. Vacation)"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Target Amount ($)"
              placeholderTextColor="#94A3B8"
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
                <X color="#475569" size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Budget Limit ($)"
              placeholderTextColor="#94A3B8"
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
                <X color="#475569" size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount to Add ($)"
              placeholderTextColor="#94A3B8"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  // NEW styles
  headerBg: {
    backgroundColor: '#faf9fa',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { color: '#737784', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { color: '#1b1c1d', fontSize: 26, fontWeight: '800', fontFamily: 'serif' },

  title: { fontSize: 28, fontWeight: '800', color: '#1b1c1d', letterSpacing: -0.5, fontFamily: 'serif' },
  subtitle: { fontSize: 15, color: '#434653', fontWeight: '500', marginBottom: 4 },

  addBtn: {
    backgroundColor: '#f5f3f4',
    width: 44, height: 44, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#e3e2e3',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  sectionWrapper: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1b1c1d', marginBottom: 14, fontFamily: 'serif' },

  budgetCard: {
    backgroundColor: '#ffffff',
    padding: 24, borderRadius: 8,
    borderWidth: 1, borderColor: '#e3e2e3',
  },
  budgetCardDanger: { borderColor: '#ba1a1a', borderWidth: 1.5 },
  budgetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  budgetLabel: { fontSize: 14, fontWeight: '600', color: '#434653', marginBottom: 6 },
  budgetSpent: { fontSize: 28, fontWeight: '800', color: '#1b1c1d', fontFamily: 'serif' },
  budgetOf: { fontSize: 18, color: '#737784', fontWeight: '600', fontFamily: 'serif' },
  budgetTitle: { fontSize: 15, fontWeight: '600', color: '#434653', marginBottom: 6 },
  budgetTotal: { fontSize: 18, color: '#737784', fontWeight: '600', fontFamily: 'serif' },
  editBtn: { padding: 8, backgroundColor: '#f5f3f4', borderRadius: 4 },
  editBudgetBtn: { padding: 6, backgroundColor: '#f5f3f4', borderRadius: 4 },
  alertBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffdad6',
    padding: 12, borderRadius: 8, marginTop: 16,
  },
  alertText: { color: '#93000a', fontSize: 13, fontWeight: '600', marginLeft: 8 },

  goalCard: {
    backgroundColor: '#ffffff',
    padding: 20, borderRadius: 8, marginBottom: 14,
    borderLeftWidth: 4, borderLeftColor: '#6d5e00',
    borderWidth: 1, borderColor: '#e3e2e3',
  },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: '#1b1c1d', fontFamily: 'serif' },
  goalSub: { fontSize: 12, color: '#737784', fontWeight: '500', marginBottom: 12 },
  goalBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  goalPct: { fontSize: 13, fontWeight: '800' },
  tapHint: { color: '#737784', fontSize: 12, fontWeight: '500', marginTop: 10, textAlign: 'center' },

  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pillBadge: { backgroundColor: '#f5f3f4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  percentage: { fontSize: 14, fontWeight: '800', color: '#094cb2' },
  tapToUpdate: { color: '#737784', fontSize: 12, fontWeight: '500', marginTop: 12, textAlign: 'center' },

  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40, backgroundColor: '#ffffff',
    borderRadius: 8, borderWidth: 1.5,
    borderColor: '#e3e2e3', borderStyle: 'dashed',
  },
  emptyText: { color: '#434653', marginTop: 12, fontSize: 15, fontWeight: '500' },
  emptyTitle: { color: '#1b1c1d', fontSize: 16, fontWeight: '700', marginTop: 12, fontFamily: 'serif' },
  emptySub: { color: '#737784', fontSize: 13, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(27,28,29,0.8)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '85%', backgroundColor: '#FAF9FA',
    borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: '#e3e2e3',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1b1c1d', fontFamily: 'serif' },
  closeBtn: { padding: 6, backgroundColor: '#e3e2e3', borderRadius: 8 },
  input: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e3e2e3',
    borderRadius: 8, padding: 16, fontSize: 16,
    marginBottom: 16, fontWeight: '500', color: '#1b1c1d',
  },
  saveBtn: {
    backgroundColor: '#094cb2', padding: 16,
    borderRadius: 8, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

