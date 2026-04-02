import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTransaction, updateTransaction, deleteTransaction, addCategory, addNotification, TransactionType, Transaction } from '../store/financeSlice';
import { X, Check, Trash2 } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  existingTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<Props> = ({ visible, onClose, existingTransaction }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(state => state.finance);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Custom Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🌟');

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (visible && existingTransaction) {
      setType(existingTransaction.type);
      setAmount(existingTransaction.amount.toString());
      setNotes(existingTransaction.notes);
      setSelectedCategoryId(existingTransaction.categoryId);
    } else if (visible && !existingTransaction) {
      setType('expense');
      setAmount('');
      setNotes('');
      setSelectedCategoryId(null);
    }
  }, [visible, existingTransaction]);

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }

    if (existingTransaction) {
      dispatch(updateTransaction({
        ...existingTransaction,
        amount: Number(amount),
        type,
        categoryId: selectedCategoryId,
        notes,
      }));
    } else {
      dispatch(addTransaction({
        amount: Number(amount),
        type,
        categoryId: selectedCategoryId,
        notes,
        date: new Date().toISOString(),
      }));
      
      if (type === 'expense' && Number(amount) >= 500) {
        dispatch(addNotification({
          title: 'High Expense Alert 🚨',
          message: `You just logged a large expense of $${amount}.`,
          type: 'info'
        }));
      }
    }
    resetAndClose();
  };

  const handleDelete = () => {
    if (existingTransaction) {
      Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            dispatch(deleteTransaction(existingTransaction.id));
            resetAndClose();
          }
        }
      ]);
    }
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Category name is required.');
      return;
    }
    dispatch(addCategory({
      name: newCatName,
      icon: newCatIcon,
      type: type,
    }));
    setIsCreatingCategory(false);
    setNewCatName('');
  };

  const resetAndClose = () => {
    setAmount('');
    setNotes('');
    setSelectedCategoryId(null);
    setIsCreatingCategory(false);
    onClose();
  };

  // Switch type and reset category
  const handleTypeSwitch = (newType: TransactionType) => {
    setType(newType);
    setSelectedCategoryId(null);
    setIsCreatingCategory(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{existingTransaction ? 'Edit Transaction' : 'Add Transaction'}</Text>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
              <X color={theme.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
              onPress={() => handleTypeSwitch('expense')}
            >
              <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
              onPress={() => handleTypeSwitch('income')}
            >
              <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>Income</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={theme.textTertiary}
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <Text style={styles.sectionTitle}>Category</Text>
          {isCreatingCategory ? (
            <View style={styles.newCategoryContainer}>
              <TextInput
                style={styles.iconInput}
                value={newCatIcon}
                onChangeText={setNewCatIcon}
                maxLength={2}
                placeholder="😎"
              />
              <TextInput
                style={styles.nameInput}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Category Name"
                placeholderTextColor={theme.textTertiary}
              />
              <TouchableOpacity style={styles.saveCatBtn} onPress={handleCreateCategory}>
                <Check color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {filteredCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPill, selectedCategoryId === cat.id && styles.catPillActive]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catName, selectedCategoryId === cat.id && styles.catNameActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.newCatBtn} onPress={() => setIsCreatingCategory(true)}>
                <Text style={styles.newCatBtnText}>+ New</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What was this for?"
            placeholderTextColor={theme.textTertiary}
            value={notes}
            onChangeText={setNotes}
          />

          <View style={styles.actionsContainer}>
            {existingTransaction && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Trash2 color="#FFFFFF" size={20} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.saveButton, existingTransaction && { flex: 1, marginLeft: 12 }]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{existingTransaction ? 'Save Changes' : 'Save Transaction'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '700', color: theme.text, fontFamily: 'serif' },
  closeButton: { padding: 4, backgroundColor: theme.skeletonBackground, borderRadius: 16 },
  
  typeSelector: { flexDirection: 'row', backgroundColor: theme.skeletonBackground, borderRadius: 12, padding: 4, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  typeBtnActiveExpense: { backgroundColor: theme.danger },
  typeBtnActiveIncome: { backgroundColor: theme.success },
  typeBtnText: { fontSize: 15, fontWeight: '600', color: theme.textSecondary },
  typeBtnTextActive: { color: '#ffffff' },

  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  currencySymbol: { fontSize: 40, fontWeight: '700', color: theme.text, marginRight: 4, marginTop: -4 },
  amountInput: { fontSize: 48, fontWeight: '700', color: theme.text, minWidth: 100 },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 12, fontFamily: 'serif' },
  categoriesScroll: { flexDirection: 'row', marginBottom: 24 },
  catPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.skeletonBackground,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10,
  },
  catPillActive: { backgroundColor: theme.primary },
  catIcon: { fontSize: 16, marginRight: 6 },
  catName: { fontSize: 14, fontWeight: '500', color: theme.text },
  catNameActive: { color: '#ffffff' },

  newCatBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed', justifyContent: 'center' },
  newCatBtnText: { color: theme.primary, fontSize: 14, fontWeight: '500' },
  
  newCategoryContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconInput: { backgroundColor: theme.skeletonBackground, borderRadius: 12, fontSize: 20, padding: 12, marginRight: 10, textAlign: 'center', width: 50 },
  nameInput: { flex: 1, backgroundColor: theme.skeletonBackground, borderRadius: 12, fontSize: 15, padding: 14, marginRight: 10, color: theme.text },
  saveCatBtn: { backgroundColor: theme.primary, padding: 12, borderRadius: 12 },

  notesInput: { backgroundColor: theme.skeletonBackground, borderRadius: 12, padding: 16, fontSize: 15, marginBottom: 32, color: theme.text },
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { backgroundColor: theme.danger, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveButton: { flex: 1, backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
