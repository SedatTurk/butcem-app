import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Income, Expense, BudgetSummary, FilterPeriod } from '../constants/types';
import { useAuth } from './AuthContext';

interface BudgetContextType {
  incomes: Income[];
  expenses: Expense[];
  summary: BudgetSummary;
  filter: FilterPeriod;
  setFilter: (f: FilterPeriod) => void;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getUpcomingPayments: () => Expense[];
}

const BudgetContext = createContext<BudgetContextType>({} as BudgetContextType);

export const useBudget = () => useContext(BudgetContext);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<FilterPeriod>('monthly');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const storageKey = (type: string) => `@${user?.id}_${type}`;

  const loadData = async () => {
    try {
      const [incData, expData] = await Promise.all([
        AsyncStorage.getItem(storageKey('incomes')),
        AsyncStorage.getItem(storageKey('expenses')),
      ]);
      if (incData) setIncomes(JSON.parse(incData));
      if (expData) setExpenses(JSON.parse(expData));
    } catch (e) {
      console.error('Load data error:', e);
    }
  };

  const saveIncomes = async (data: Income[]) => {
    setIncomes(data);
    await AsyncStorage.setItem(storageKey('incomes'), JSON.stringify(data));
  };

  const saveExpenses = async (data: Expense[]) => {
    setExpenses(data);
    await AsyncStorage.setItem(storageKey('expenses'), JSON.stringify(data));
  };

  const addIncome = async (income: Omit<Income, 'id'>) => {
    const newIncome: Income = { ...income, id: Date.now().toString() };
    await saveIncomes([...incomes, newIncome]);
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    const updated = incomes.map(i => i.id === id ? { ...i, ...updates } : i);
    await saveIncomes(updated);
  };

  const deleteIncome = async (id: string) => {
    await saveIncomes(incomes.filter(i => i.id !== id));
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: Date.now().toString() };
    await saveExpenses([...expenses, newExpense]);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const updated = expenses.map(e => e.id === id ? { ...e, ...updates } : e);
    await saveExpenses(updated);
  };

  const deleteExpense = async (id: string) => {
    await saveExpenses(expenses.filter(e => e.id !== id));
  };

  const getMonthlyAmount = (amount: number, freq: string): number => {
    switch (freq) {
      case 'daily': return amount * 30;
      case 'weekly': return amount * 4;
      case 'monthly': return amount;
      case 'yearly': return amount / 12;
      default: return amount;
    }
  };

  const summary: BudgetSummary = React.useMemo(() => {
    const totalIncome = incomes
      .filter(i => i.isActive)
      .reduce((sum, i) => sum + getMonthlyAmount(i.amount, i.frequency), 0);

    const totalExpenses = expenses
      .reduce((sum, e) => sum + getMonthlyAmount(e.amount, e.frequency), 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    const categoryMap = new Map<string, number>();
    expenses.forEach(e => {
      const monthly = getMonthlyAmount(e.amount, e.frequency);
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + monthly);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { totalIncome, totalExpenses, balance, savingsRate, categoryBreakdown };
  }, [incomes, expenses]);

  const getUpcomingPayments = useCallback((): Expense[] => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expenses
      .filter(e => {
        if (!e.dueDate) return false;
        const due = new Date(e.dueDate);
        return due >= now && due <= nextWeek && !e.isPaid;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [expenses]);

  return (
    <BudgetContext.Provider
      value={{
        incomes, expenses, summary, filter, setFilter,
        addIncome, updateIncome, deleteIncome,
        addExpense, updateExpense, deleteExpense,
        getUpcomingPayments,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}
