export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: string;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string;
  dueDate?: string;
  isPaid: boolean;
  reminderEnabled: boolean;
}

export interface AIInsight {
  id: string;
  type: 'saving' | 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  amount?: number;
  category?: string;
  icon: string;
  color: string;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
}

export type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
