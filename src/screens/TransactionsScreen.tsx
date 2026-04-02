import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, LayoutAnimation } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { TransactionCard } from '../components/TransactionCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { Plus, Search } from 'lucide-react-native';
import { Transaction } from '../store/financeSlice';
import { useTheme, ThemeColors } from '../theme/colors';

export const TransactionsScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { transactions, categories } = useAppSelector(state => state.finance);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Filtering Logic
  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery) return true;
    
    const cat = categories.find(c => c.id === t.categoryId);
    const catName = cat ? cat.name.toLowerCase() : '';
    const notesLower = t.notes ? t.notes.toLowerCase() : '';
    const queryLower = searchQuery.toLowerCase();
    
    return catName.includes(queryLower) || notesLower.includes(queryLower);
  });

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [filteredTransactions]);

  const openAddModal = () => {
    setEditingTransaction(null);
    setModalVisible(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={theme.textTertiary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by category or notes..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <SkeletonLoader width={50} height={50} borderRadius={25} style={{ marginRight: 16, backgroundColor: theme.skeletonHighlight }} />
              <View style={{ flex: 1 }}>
                <SkeletonLoader width={120} height={16} borderRadius={4} style={{ marginBottom: 8, backgroundColor: theme.skeletonHighlight }} />
                <SkeletonLoader width={80} height={12} borderRadius={4} style={{ backgroundColor: theme.skeletonBackground }} />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <SkeletonLoader width={60} height={16} borderRadius={4} style={{ marginBottom: 8, backgroundColor: theme.skeletonHighlight }} />
                <SkeletonLoader width={40} height={12} borderRadius={4} style={{ backgroundColor: theme.skeletonBackground }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => openEditModal(item)} activeOpacity={0.7} style={{ paddingHorizontal: 16 }}>
              <TransactionCard
                transaction={item}
                category={categories.find(c => c.id === item.categoryId)}
                index={index}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? "No transactions found." : "No transactions yet."}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={openAddModal}
      >
        <Plus color="#FFFFFF" size={24} />
      </TouchableOpacity>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        existingTransaction={editingTransaction}
      />
    </View>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: theme.background },
  title: { fontSize: 28, fontWeight: '800', color: theme.text, fontFamily: 'serif' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card,
    marginHorizontal: 16, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16,
    borderWidth: 1, borderColor: theme.border,
  },
  searchIcon: { marginRight: 8, color: theme.textTertiary },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: theme.text },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: theme.textSecondary, fontSize: 16 },
  fab: {
    position: 'absolute', right: 20, width: 60, height: 60,
    borderRadius: 8, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 0, borderWidth: 1, borderColor: theme.primary,
  },
});
