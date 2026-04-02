import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { TransactionCard } from '../components/TransactionCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { Plus, Search } from 'lucide-react-native';
import { Transaction } from '../store/financeSlice';

export const TransactionsScreen = () => {
  const insets = useSafeAreaInsets();
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
        <Search color="#8E8E93" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by category or notes..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <SkeletonLoader width={50} height={50} borderRadius={25} style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <SkeletonLoader width={120} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                <SkeletonLoader width={80} height={12} borderRadius={4} />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <SkeletonLoader width={60} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                <SkeletonLoader width={40} height={12} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" colors={['#0EA5E9']} />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openEditModal(item)} activeOpacity={0.7} style={{ paddingHorizontal: 16 }}>
              <TransactionCard
                transaction={item}
                category={categories.find(c => c.id === item.categoryId)}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
