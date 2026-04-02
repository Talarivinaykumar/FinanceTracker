import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTransaction, addCategory, TransactionType } from '../store/financeSlice';
import { X, Check } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<Props> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
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

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }

    dispatch(addTransaction({
      amount: Number(amount),
      type,
      categoryId: selectedCategoryId,
      notes,
      date: new Date().toISOString(),
    }));
    
    resetAndClose();
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
            <Text style={styles.title}>Add Transaction</Text>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
              <X color="#1C1C1E" size={24} />
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
              placeholderTextColor="#C7C7CC"
              value={amount}
              onChangeText={setAmount}
              autoFocus
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
              <TouchableOpacity
                style={styles.newCatBtn}
                onPress={() => setIsCreatingCategory(true)}
              >
                <Text style={styles.newCatBtnText}>+ New</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What was this for?"
            placeholderTextColor="#8E8E93"
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnActiveExpense: {
    backgroundColor: '#D32F2F',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#2E7D32',
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1C1C1E',
    marginRight: 4,
    marginTop: -4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1C1C1E',
    minWidth: 100,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  catPillActive: {
    backgroundColor: '#1C1C1E',
  },
  catIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  catName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  catNameActive: {
    color: '#FFFFFF',
  },
  newCatBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  newCatBtnText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  newCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    fontSize: 20,
    padding: 12,
    marginRight: 10,
    textAlign: 'center',
    width: 50,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    fontSize: 15,
    padding: 14,
    marginRight: 10,
  },
  saveCatBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 12,
  },
  notesInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 32,
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
