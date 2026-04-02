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
        <View style={{ paddingHorizontal: 20, marginTop: -40 }}>
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
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#0D9488',
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },

  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#64748B', fontWeight: '500', marginBottom: 4 },

  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  sectionWrapper: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 14 },

  budgetCard: {
    backgroundColor: '#FFFFFF',
    padding: 24, borderRadius: 24,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 4,
  },
  budgetCardDanger: { borderColor: 'rgba(239,68,68,0.35)', borderWidth: 1.5 },
  budgetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  budgetLabel: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  budgetSpent: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  budgetOf: { fontSize: 18, color: '#94A3B8', fontWeight: '600' },
  budgetTitle: { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  budgetTotal: { fontSize: 18, color: '#94A3B8', fontWeight: '600' },
  editBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  editBudgetBtn: { padding: 6, backgroundColor: '#F1F5F9', borderRadius: 12 },
  alertBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    padding: 12, borderRadius: 12, marginTop: 16,
  },
  alertText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginLeft: 8 },

  goalCard: {
    backgroundColor: '#FFFFFF',
    padding: 20, borderRadius: 22, marginBottom: 14,
    borderLeftWidth: 4, borderLeftColor: '#6366F1',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  goalSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginBottom: 12 },
  goalBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  goalPct: { fontSize: 13, fontWeight: '800' },
  tapHint: { color: '#94A3B8', fontSize: 12, fontWeight: '500', marginTop: 10, textAlign: 'center' },

  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pillBadge: { backgroundColor: 'rgba(14,165,233,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  percentage: { fontSize: 14, fontWeight: '800', color: '#0EA5E9' },
  tapToUpdate: { color: '#94A3B8', fontSize: 12, fontWeight: '500', marginTop: 12, textAlign: 'center' },

  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40, backgroundColor: '#FFFFFF',
    borderRadius: 22, borderWidth: 1.5,
    borderColor: '#E2E8F0', borderStyle: 'dashed',
  },
  emptyText: { color: '#64748B', marginTop: 12, fontSize: 15, fontWeight: '500' },
  emptyTitle: { color: '#334155', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySub: { color: '#94A3B8', fontSize: 13, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '85%', backgroundColor: '#FFFFFF',
    borderRadius: 28, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F1F5F9', borderRadius: 16 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16, padding: 16, fontSize: 16,
    marginBottom: 16, fontWeight: '500', color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#0D9488', padding: 16,
    borderRadius: 16, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

