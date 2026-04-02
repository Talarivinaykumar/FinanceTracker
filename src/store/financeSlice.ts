import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string; // references Category.id
  date: string; // ISO string
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
}

export const defaultCategories: Category[] = [
  // Expenses
  { id: 'exp-food', name: 'Food', icon: '🍔', type: 'expense' },
  { id: 'exp-transport', name: 'Transport', icon: '🚗', type: 'expense' },
  { id: 'exp-bills', name: 'Bills', icon: '⚡', type: 'expense' },
  { id: 'exp-shopping', name: 'Shopping', icon: '🛍️', type: 'expense' },
  { id: 'exp-entertainment', name: 'Entertainment', icon: '🎬', type: 'expense' },
  { id: 'exp-health', name: 'Health', icon: '🏥', type: 'expense' },
  { id: 'exp-education', name: 'Education', icon: '📚', type: 'expense' },
  { id: 'exp-other', name: 'Others', icon: '🏷️', type: 'expense' },
  // Income
  { id: 'inc-salary', name: 'Salary', icon: '💼', type: 'income' },
  { id: 'inc-freelance', name: 'Freelance', icon: '💻', type: 'income' },
  { id: 'inc-business', name: 'Business', icon: '📈', type: 'income' },
  { id: 'inc-gifts', name: 'Gifts', icon: '🎁', type: 'income' },
  { id: 'inc-other', name: 'Others', icon: '💰', type: 'income' },
];

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  monthlyBudget: number;
}

const initialState: FinanceState = {
  transactions: [],
  categories: defaultCategories,
  goals: [
    {
      id: 'g-default-1',
      title: 'Emergency Fund',
      target: 5000,
      current: 1000,
    }
  ],
  monthlyBudget: 2000,
};

export const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Omit<Transaction, 'id'>>) => {
      const newTransaction: Transaction = {
        ...action.payload,
        id: uuidv4(),
      };
      state.transactions.push(newTransaction);
      // Sort by date descending
      state.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
        // Re-sort after updating
        state.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    },
    addCategory: (state, action: PayloadAction<Omit<Category, 'id'>>) => {
      const newCategory: Category = {
        ...action.payload,
        id: uuidv4(),
      };
      state.categories.push(newCategory);
    },
    addGoal: (state, action: PayloadAction<Omit<Goal, 'id'>>) => {
      state.goals.push({
        ...action.payload,
        id: uuidv4(),
      });
    },
    updateGoal: (state, action: PayloadAction<{ id: string; amountToAdd: number }>) => {
      const goal = state.goals.find(g => g.id === action.payload.id);
      if (goal) {
        goal.current += action.payload.amountToAdd;
      }
    },
    setMonthlyBudget: (state, action: PayloadAction<number>) => {
      state.monthlyBudget = action.payload;
    },
  },
});

export const { addTransaction, deleteTransaction, updateTransaction, addCategory, addGoal, updateGoal, setMonthlyBudget } = financeSlice.actions;

export default financeSlice.reducer;
