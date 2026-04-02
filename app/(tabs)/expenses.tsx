import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Modal, Alert, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { useBudget } from '../../services/BudgetContext';
import { Colors, FontSize, BorderRadius, Spacing, Shadow, CategoryIcons } from '../../constants/theme';
import { formatCurrency, getFrequencyLabel } from '../../services/AIEngine';

const FREQUENCIES = ['once', 'daily', 'weekly', 'monthly', 'yearly'] as const;
const FREQ_LABELS: Record<string, string> = {
  once: 'Tek Sefer',
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  yearly: 'Yıllık',
};

const CATEGORIES = Object.keys(CategoryIcons);

export default function ExpensesScreen() {
  const { user } = useAuth();
  const { expenses, addExpense, deleteExpense, summary } = useBudget();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('market');
  const [frequency, setFrequency] = useState<typeof FREQUENCIES[number]>('monthly');
  const [dueDay, setDueDay] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }

    let dueDate: string | undefined;
    if (dueDay.trim()) {
      const day = parseInt(dueDay);
      if (day >= 1 && day <= 31) {
        const now = new Date();
        const due = new Date(now.getFullYear(), now.getMonth(), day);
        if (due < now) due.setMonth(due.getMonth() + 1);
        dueDate = due.toISOString();
      }
    }

    await addExpense({
      title: title.trim(),
      amount: numAmount,
      category,
      frequency,
      date: new Date().toISOString(),
      dueDate,
      isPaid: false,
      reminderEnabled: !!dueDate,
    });
    setTitle('');
    setAmount('');
    setCategory('market');
    setFrequency('monthly');
    setDueDay('');
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Sil', `"${name}" giderini silmek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Giderler</Text>
            <Text style={styles.subtitle}>Harcamalarınızı takip edin</Text>
          </View>

          {/* Total Expense Card */}
          <LinearGradient
            colors={['rgba(255,61,110,0.12)', 'rgba(255,61,110,0.03)']}
            style={styles.totalCard}
          >
            <View style={styles.totalLeft}>
              <View style={styles.totalIconBg}>
                <Ionicons name="trending-down" size={24} color={Colors.danger} />
              </View>
              <View>
                <Text style={styles.totalLabel}>Toplam Aylık Gider</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(summary.totalExpenses, user?.currency)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Expense List */}
          {expenses.length > 0 ? (
            <View style={styles.list}>
              {expenses.map((expense) => {
                const catInfo = CategoryIcons[expense.category] || {
                  icon: 'ellipsis-horizontal', color: Colors.neonPurple, label: expense.category,
                };
                return (
                  <View key={expense.id} style={styles.expenseCard}>
                    <View style={[styles.catIconBg, { backgroundColor: catInfo.color + '20' }]}>
                      <Ionicons name={catInfo.icon as any} size={20} color={catInfo.color} />
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseName}>{expense.title}</Text>
                      <View style={styles.expenseMeta}>
                        <Text style={[styles.expenseCategory, { color: catInfo.color }]}>
                          {catInfo.label}
                        </Text>
                        <Text style={styles.expenseDot}>•</Text>
                        <Text style={styles.expenseFreq}>{getFrequencyLabel(expense.frequency)}</Text>
                      </View>
                    </View>
                    <Text style={styles.expenseAmount}>
                      -{formatCurrency(expense.amount, user?.currency)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(expense.id, expense.title)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Henüz gider eklenmedi</Text>
              <Text style={styles.emptyText}>
                Kira, fatura, market gibi harcamalarınızı ekleyerek takibe başlayın.
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <LinearGradient
          colors={[Colors.gradientPurpleStart, Colors.neonPurple]}
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Gider Ekle</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gider Adı</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Ev kirası, Elektrik..."
                  placeholderTextColor={Colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tutar ({user?.currency || '₺'})</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kategori</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map(cat => {
                    const info = CategoryIcons[cat];
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryBtn,
                          category === cat && { borderColor: info.color, backgroundColor: info.color + '15' },
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        <Ionicons name={info.icon as any} size={16} color={category === cat ? info.color : Colors.textMuted} />
                        <Text style={[styles.categoryBtnText, category === cat && { color: info.color }]}>
                          {info.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sıklık</Text>
                <View style={styles.freqRow}>
                  {FREQUENCIES.map(f => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                      onPress={() => setFrequency(f)}
                    >
                      <Text style={[styles.freqBtnText, frequency === f && styles.freqBtnTextActive]}>
                        {FREQ_LABELS[f]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ödeme Günü (opsiyonel, hatırlatma için)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: 15 (ayın 15'i)"
                  placeholderTextColor={Colors.textMuted}
                  value={dueDay}
                  onChangeText={setDueDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAdd} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[Colors.gradientPurpleStart, Colors.neonPurple]}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveBtnText}>Kaydet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: 60 },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  totalCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.xl, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.danger + '30',
    marginBottom: Spacing.xxl,
  },
  totalLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  totalIconBg: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.danger + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  totalAmount: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.danger, marginTop: 2 },
  list: { gap: Spacing.md },
  expenseCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md,
  },
  catIconBg: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  expenseInfo: { flex: 1 },
  expenseName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 },
  expenseCategory: { fontSize: FontSize.xs, fontWeight: '600' },
  expenseDot: { fontSize: FontSize.xs, color: Colors.textMuted },
  expenseFreq: { fontSize: FontSize.xs, color: Colors.textSecondary },
  expenseAmount: { fontSize: FontSize.md, fontWeight: '700', color: Colors.danger },
  deleteBtn: { padding: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...Shadow.neonPurple,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalScroll: { maxHeight: '90%' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xxl, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.textMuted, alignSelf: 'center', marginBottom: Spacing.xl,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xxl },
  inputGroup: { marginBottom: Spacing.xl },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md,
    padding: Spacing.lg, color: Colors.textPrimary, fontSize: FontSize.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border,
  },
  categoryBtnText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  freqRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  freqBtn: {
    paddingHorizontal: 14, paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  freqBtnActive: { borderColor: Colors.neonPurple, backgroundColor: Colors.neonPurple + '20' },
  freqBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  freqBtnTextActive: { color: Colors.neonPurple },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  cancelBtn: {
    flex: 1, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
